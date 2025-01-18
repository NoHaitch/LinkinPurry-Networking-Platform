import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  UserMinus,
  Search,
  UserCheck,
  UserX,
  Clock,
  Loader2,
} from "lucide-react";

import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import axiosInstance from "@/api/axios";

interface User {
  id: string;
  full_name: string;
  profile_photo_path: string;
  isConnected: boolean;
  isSecondDegree: boolean;
  isThirdDegree: boolean;
  isOwner: boolean;
}

interface ConnectionRequest {
  from_id: string;
  created_at: string;
  users_connection_request_from_idTousers: {
    id: string;
    full_name: string;
    profile_photo_path: string;
  };
}

interface UsersResponse {
  success: boolean;
  message: string;
  body: User[];
  error: string;
}

interface RequestsResponse {
  success: boolean;
  message: string;
  body: ConnectionRequest[];
  error: string;
}

export default function People() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isLoggedIn = !!user;

  const [users, setUsers] = useState<User[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<
    ConnectionRequest[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState("");

  const fetchUsers = useCallback(async (search: string = "") => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<UsersResponse>(
        `/connection/users?search=${search}`,
      );
      if (response.data.success) {
        setUsers(response.data.body);
      } else {
        throw new Error(response.data.message || "Failed to fetch users");
      }
    } catch (err) {
      setError("Failed to fetch users. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounce = setTimeout(async () => {
      fetchUsers(userSearch);
    }, 300);

    return () => clearTimeout(debounce);
  }, [userSearch]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchConnectionRequests();
    }
  }, [isLoggedIn]);

  const fetchConnectionRequests = async () => {
    try {
      const response = await axiosInstance.get<RequestsResponse>(
        "/connection/requests",
      );
      if (response.data.success) {
        setConnectionRequests(response.data.body);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch connection requests",
        );
      }
    } catch (err) {
      console.error("Error fetching connection requests:", err);
      toast({
        title: "Error",
        description: "Failed to fetch connection requests. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleConnect = async (id: string) => {
    try {
      const response = await axiosInstance.post<UsersResponse>(
        `/connection/${id}/request`,
      );
      if (response.data.success) {
        toast({
          title: "Connected",
          description: "Connection request sent.",
          variant: "success",
        });
      } else {
        throw new Error(response.data.error || "Failed to connect");
      }
    } catch (err: any) {
      console.error("Error connecting to user:", err.response.data.error);
      toast({
        title: "Connection Failed",
        description:
          "Failed to connect. " +
          err.response.data.error +
          ". Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async (id: string) => {
    try {
      const response = await axiosInstance.delete<UsersResponse>(
        `/connection/${id}`,
      );
      if (response.data.success) {
        setUsers(
          users.map((user) =>
            user.id === id ? { ...user, isConnected: false } : user,
          ),
        );
        toast({
          title: "Disconnected",
          description: "You are no longer connected with this user.",
          variant: "success",
        });
      } else {
        throw new Error(response.data.message || "Failed to disconnect");
      }
    } catch (err) {
      console.error("Error disconnecting from user:", err);
      toast({
        title: "Disconnection Failed",
        description: "Failed to disconnect. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAcceptRequest = async (id: string) => {
    try {
      const response = await axiosInstance.post(
        `/connection/${id}/respond`,
        { action: "accept" },
        { withCredentials: true },
      );
      if (response.data.success) {
        setConnectionRequests(
          connectionRequests.filter((request) => request.from_id !== id),
        );
        toast({
          title: "Request Accepted",
          description: "You have accepted the connection request.",
          variant: "success",
        });
        fetchUsers(userSearch);
      } else {
        throw new Error(response.data.message || "Failed to accept request");
      }
    } catch (err) {
      console.error("Error accepting connection request:", err);
      toast({
        title: "Accept Failed",
        description: "Failed to accept the request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (id: string) => {
    try {
      const response = await axiosInstance.post(
        `/connection/${id}/respond`,
        { action: "reject" },
        { withCredentials: true },
      );
      if (response.data.success) {
        setConnectionRequests(
          connectionRequests.filter((request) => request.from_id !== id),
        );
        toast({
          title: "Request Rejected",
          description: "You have rejected the connection request.",
          variant: "success",
        });
      } else {
        throw new Error(response.data.message || "Failed to reject request");
      }
    } catch (err) {
      console.error("Error rejecting connection request:", err);
      toast({
        title: "Reject Failed",
        description: "Failed to reject the request. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <motion.div
        key="loader"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-screen items-center justify-center"
      >
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </motion.div>
    );
  }

  return (
    <div className="flex min-h-screen w-screen flex-col">
      <Navbar />
      <main className="container mx-auto mb-14 mt-14 max-w-5xl px-4 py-8">
        {isLoggedIn && connectionRequests.length > 0 ? (
          <Card className="mb-8 overflow-hidden">
            {/* { authenticated, have invitation } */}
            <CardHeader className="border-b px-6 py-4">
              <CardTitle className="text-xl font-semibold">
                Connection Invitations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {connectionRequests.map((request) => (
                <div
                  key={request.from_id}
                  className="flex items-center justify-between border-b py-4 last:border-b-0"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={
                          request.users_connection_request_from_idTousers
                            .profile_photo_path
                        }
                        alt={
                          request.users_connection_request_from_idTousers
                            .full_name
                        }
                      />
                      <AvatarFallback>
                        {request.users_connection_request_from_idTousers.full_name.charAt(
                          0,
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-black">
                        {
                          request.users_connection_request_from_idTousers
                            .full_name
                        }
                      </h3>
                      <p className="text-sm text-gray-500">
                        Sent {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700"
                      onClick={() => handleAcceptRequest(request.from_id)}
                    >
                      <UserCheck className="mr-2 h-4 w-4" />
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleRejectRequest(request.from_id)}
                    >
                      <UserX className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          isLoggedIn && (
            <Card className="mb-8 overflow-hidden">
              {/* { authenticated, no invitation } */}
              <CardHeader className="border-b px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-semibold">
                      Connection Invitations
                    </CardTitle>
                    <p className="flex items-center text-sm text-gray-600">
                      No <Clock className="mx-1 h-4 w-4" />
                      Pending Connection Invite.
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )
        )}
        <Card className="overflow-hidden">
          <CardHeader className="border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl font-semibold">
                  People You May Know
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Connect with professionals in your industry
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="mb-4 flex items-center">
              <Search className="mr-2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search people"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="flex-grow"
              />
            </div>
            {error ? (
              <div className="py-4 text-center text-red-500">{error}</div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-4">
                <AnimatePresence>
                  {users.map((user) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="relative flex flex-col items-center justify-between space-y-2 overflow-hidden rounded-lg border p-4 text-center"
                    >
                      <img
                        className="absolute left-0 top-0 z-0 h-16 w-full object-cover"
                        alt="banner"
                        src="/image/background-image.webp"
                      />
                      <div className="relative z-10 flex flex-col items-center justify-between space-y-2 text-center">
                        <div className="relative z-10 flex flex-col items-center space-x-4">
                          <Link
                            to={"/profile/" + user.id}
                            className="flex flex-col items-center"
                          >
                            <Avatar className="relative z-10 h-16 w-16">
                              <AvatarImage
                                src={user.profile_photo_path}
                                alt={user.full_name}
                              />
                              <AvatarFallback>
                                {user.full_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span>
                              <h3 className="relative z-10 font-semibold text-black">
                                {user.full_name}
                              </h3>
                              <h4 className="relative z-10 text-xs text-gray-600">
                                {user.isConnected
                                  ? "1st"
                                  : user.isSecondDegree
                                    ? "2nd"
                                    : user.isThirdDegree
                                      ? "3rd"
                                      : ""}
                              </h4>
                            </span>
                          </Link>
                        </div>
                        {!user.isOwner ? (
                          user.isConnected ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="relative z-10 rounded-full border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-700"
                              onClick={() => handleDisconnect(user.id)}
                            >
                              <UserMinus className="mr-2 h-4 w-4" />
                              Connected
                            </Button>
                          ) : isLoggedIn ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="relative z-10 rounded-full border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                              onClick={() => {
                                handleConnect(user.id);
                              }}
                            >
                              <UserPlus className="mr-2 h-4 w-4" />
                              Connect
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="relative z-10 rounded-full border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                              onClick={() => {
                                navigate("/login");
                              }}
                            >
                              <UserPlus className="mr-2 h-4 w-4" />
                              Connect
                            </Button>
                          )
                        ) : (
                          <p className="text-xs">Me</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
            {!isLoading && !error && users.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="p-6 text-center text-gray-500"
              >
                <p className="text-lg">No users found</p>
                <p className="text-sm">Try adjusting your search criteria</p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
