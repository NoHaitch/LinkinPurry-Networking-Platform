import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format, isSameDay, isToday, isYesterday } from "date-fns";
import { Send, ArrowLeft } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Navbar } from "@/components/navbar";

import { useSocket } from "@/hooks/useSocket";
import { useAuth } from "@/hooks/useAuth";
import axiosInstance from "@/api/axios";
import { toast } from "@/hooks/use-toast";
import Typing from "@/components/ui/typing";

interface User {
  id: string;
  full_name: string;
  profile_photo_path: string;
}
interface Chat {
  id?: string;
  timestamp: string;
  message: string;
  from_id: string;
  to_id: string;
}

const trimMessage = (message: string, maxLength: number = 30): string => {
  if (message.length > maxLength) {
    return message.slice(0, maxLength) + "...";
  }
  return message;
};

export default function Chat() {
  const [connections, setConnections] = useState<User[]>([]);
  const { targetId } = useParams();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { user } = useAuth();
  const userId = user?.userId;
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [recentChats, setRecentChats] = useState<{ [key: string]: Chat }>({});
  const navigate = useNavigate();
  let lastMessageDate: Date | null = null;
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [showUserList, setShowUserList] = useState(true);

  const fetchConnections = async () => {
    try {
      let url = `connection/${userId}/connections`;
      const { data } = await axiosInstance.get(url);
      setConnections(data.body);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch connections. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleSelectedUser = (user: User) => {
    navigate("/messaging/" + user.id);
    setSelectedUser(user);
    if (isMobileView) {
      setShowUserList(false);
    }
  };

  const fetchChatHistory = async (targetId: string) => {
    try {
      let url = `chat/${targetId}`;
      const { data } = await axiosInstance.get(url);
      setChatHistory(data.body);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch chat history. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const fetchRecentChats = async () => {
    try {
      let url = `chat/recents`;
      const { data } = await axiosInstance.get(url);
      setRecentChats(data.body);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch recent chats. Please try again later.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (userId) {
      fetchConnections();
      fetchRecentChats();
    }
  }, [userId]);

  useEffect(() => {
    if (targetId) {
      fetchChatHistory(targetId);
    }
  }, [targetId]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const socketData = useSocket(
    userId as string,
    targetId as string,
    setRecentChats,
  );

  const {
    error = "",
    message,
    chatHistory,
    setMessage,
    sendMessage,
    setChatHistory,
    isTyping,
    handleTyping,
  } = socketData;

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [message, selectedUser, chatHistory]);

  useEffect(() => {
    if (targetId) {
      setSelectedUser(connections?.find((c) => c.id === targetId) as User);
    }
  }, [targetId, connections]);

  return (
    <>
      <Navbar />
      {isMobileView ? (
        <div className="mx-auto mt-14 flex h-[calc(100vh-4rem)] w-screen max-w-6xl flex-col rounded-lg bg-white shadow-lg">
          {showUserList ? (
            <div className="flex flex-1 flex-col">
              <div className="border-b p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Messaging</h2>
                </div>
              </div>
              <ScrollArea className="flex-1 bg-white">
                {connections.map((connection) => {
                  const recentChat = recentChats[connection.id];
                  const lastMessage = recentChat
                    ? recentChat.message
                    : "No messages yet";

                  return (
                    <div
                      key={connection.id}
                      className="cursor-pointer p-4 hover:bg-gray-50"
                      onClick={() => handleSelectedUser(connection)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={connection.profile_photo_path}
                            alt={connection.full_name}
                          />
                          <AvatarFallback>
                            {connection.full_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col">
                            <p className="mb-0 truncate font-semibold text-black">
                              {connection.full_name}
                            </p>
                            <p className="text-sm text-gray-400">
                              {recentChat?.from_id === userId
                                ? "You: "
                                : connection.full_name + ": "}
                              {trimMessage(lastMessage)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </ScrollArea>
            </div>
          ) : (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b bg-white p-4">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowUserList(true)}
                    className="mr-2"
                  >
                    <ArrowLeft className="h-6 w-6" />
                  </Button>
                  {selectedUser && (
                    <>
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={selectedUser.profile_photo_path}
                          alt={selectedUser.full_name}
                        />
                        <AvatarFallback>
                          {selectedUser.full_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">
                          {selectedUser.full_name}
                        </h3>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <ScrollArea className="flex-1">
                <div className="space-y-4 p-4">
                  {error && (
                    <div className="mb-4 text-sm text-red-500">{error}</div>
                  )}
                  {chatHistory?.length === 0 ? (
                    <p className="text-center text-gray-400">No messages yet</p>
                  ) : (
                    <>
                      {chatHistory?.map((msg) => {
                        const messageDate = new Date(msg.timestamp);

                        const isNewDay = !isSameDay(
                          lastMessageDate as Date,
                          messageDate,
                        );
                        const isTodayMessage = isToday(messageDate);
                        const isYesterdayMessage = isYesterday(messageDate);

                        const time = format(messageDate, "h:mm a");

                        let dateSeparator = "";
                        if (isTodayMessage) {
                          dateSeparator = "Today";
                        } else if (isYesterdayMessage) {
                          dateSeparator = "Yesterday";
                        } else if (isNewDay) {
                          dateSeparator = format(messageDate, "MMM dd, yyyy");
                        }
                        lastMessageDate = messageDate;

                        return (
                          <div key={msg.id}>
                            {isNewDay && (
                              <div className="my-2 text-center text-xs text-gray-500">
                                {dateSeparator}
                              </div>
                            )}
                            <div
                              className={`flex ${
                                msg.from_id === userId
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-[70%] rounded-lg p-3 ${
                                  msg.from_id === userId
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-100"
                                }`}
                              >
                                <p className="text-inherit mb-0 text-wrap break-all">
                                  {msg.message}
                                </p>
                                <p className="text-inherit text-xs mt-1 opacity-70">
                                  {time}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {isTyping && <Typing />}
                      <div ref={chatEndRef} />
                    </>
                  )}
                </div>
              </ScrollArea>
              <div className="border-t bg-white p-4">
                <div className="flex gap-2">
                  <Input
                    className="flex-1"
                    placeholder="Write a message..."
                    value={message}
                    onChange={(e) => {
                      setMessage && setMessage(e.target.value);
                      handleTyping();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage && sendMessage();
                      }
                    }}
                  />
                  <Button onClick={sendMessage}>
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mx-auto mt-14 flex h-[calc(100vh-4rem)] w-screen max-w-6xl overflow-hidden rounded-lg bg-white shadow-lg">
          {/* Left Sidebar */}
          <div className="flex w-80 flex-col border-r">
            <div className="border-b p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Messaging</h2>
              </div>
            </div>
            <ScrollArea className="flex-1">
              {connections.map((connection) => {
                const recentChat = recentChats[connection.id];
                const lastMessage = recentChat
                  ? recentChat.message
                  : "No messages yet";

                return (
                  <div
                    key={connection.id}
                    className={`cursor-pointer p-4 hover:bg-gray-50 ${connection.id === targetId ? "bg-gray-100" : ""}`}
                    onClick={() => handleSelectedUser(connection)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={connection.profile_photo_path}
                          alt={connection.full_name}
                        />
                        <AvatarFallback>
                          {connection.full_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col">
                          <p className="mb-0 truncate font-semibold text-black">
                            {connection.full_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {recentChat?.from_id === userId
                              ? "You: "
                              : connection.full_name + ": "}
                            {trimMessage(lastMessage)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex flex-1 flex-col">
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between border-b p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={selectedUser.profile_photo_path}
                        alt={selectedUser.full_name}
                      />
                      <AvatarFallback>
                        {selectedUser.full_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {selectedUser.full_name}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <ScrollArea className="flex-1 p-4">
                  {error && (
                    <div className="mb-4 text-sm text-red-500">{error}</div>
                  )}
                  {chatHistory?.length === 0 ? (
                    <p className="text-center text-gray-400">No messages yet</p>
                  ) : (
                    <div className="space-y-4">
                      {chatHistory?.map((msg) => {
                        const messageDate = new Date(msg.timestamp);

                        const isNewDay = !isSameDay(
                          lastMessageDate as Date,
                          messageDate,
                        );
                        const isTodayMessage = isToday(messageDate);
                        const isYesterdayMessage = isYesterday(messageDate);

                        const time = format(messageDate, "h:mm a");

                        let dateSeparator = "";
                        if (isTodayMessage) {
                          dateSeparator = "Today";
                        } else if (isYesterdayMessage) {
                          dateSeparator = "Yesterday";
                        } else if (isNewDay) {
                          dateSeparator = format(messageDate, "MMM dd, yyyy");
                        }
                        lastMessageDate = messageDate;

                        return (
                          <div key={msg.id}>
                            {/* Date separator */}
                            {isNewDay && (
                              <div className="my-2 text-center text-xs text-gray-500">
                                {dateSeparator}
                              </div>
                            )}

                            {/* Message content */}
                            <div
                              className={`flex overflow-y-hidden ${
                                msg.from_id === userId
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-[70%] rounded-lg p-3 ${
                                  msg.from_id === userId
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-100"
                                }`}
                              >
                                <p className="text-inherit mb-0 text-wrap break-all">
                                  {msg.message}
                                </p>
                                <p className="text-inherit text-xs mt-1 opacity-70">
                                  {time}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {isTyping && <Typing />}
                      {/* This is the reference for scrolling */}
                      <div ref={chatEndRef} />
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      className="flex-1"
                      placeholder="Write a message..."
                      value={message}
                      onChange={(e) => {
                        setMessage && setMessage(e.target.value);
                        handleTyping();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage && sendMessage();
                        }
                      }}
                    />
                    <Button onClick={sendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-gray-400">
                Select a conversation to start messaging
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
