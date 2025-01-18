import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Send, LogIn, Loader2, Trash2, Pencil } from "lucide-react";

import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import axiosInstance from "@/api/axios";

const ITEMS_PER_PAGE = 10;

interface FeedItem {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  users: {
    id: string;
    full_name: string;
    profile_photo_path: string;
  };
}

interface UserProfile {
  name: string;
  profile_photo_path: string;
}

function Feed() {
  const [postContent, setPostContent] = useState("");
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const observerRef = useRef<IntersectionObserver | null>(null);

  const [editingPost, setEditingPost] = useState<FeedItem | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const handleEditPost = (post: FeedItem) => {
    setEditingPost(post);
    setEditContent(post.content);
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    setEditContent("");
  };

  const handleSaveEdit = async () => {
    if (!editingPost) return;

    try {
      const response = await axiosInstance.put(
        `/feed/${editingPost.id}`,
        { content: editContent },
        { withCredentials: true },
      );
      if (response.data.success) {
        setEditingPost(null);
        setEditContent("");
        setFeedItems((prevItems) =>
          prevItems.map((item) =>
            item.id === editingPost.id
              ? { ...item, content: editContent }
              : item,
          ),
        );
        toast({
          title: "Post updated",
          description: "Your post has been successfully updated.",
          variant: "success",
        });
      } else {
        throw new Error(response.data.message || "Failed to update post");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      toast({
        title: "Error",
        description: "Failed to update post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;

    try {
      const response = await axiosInstance.delete(`/feed/${postToDelete}`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setIsDeleteDialogOpen(false);
        setPostToDelete(null);
        setFeedItems((prevItems) =>
          prevItems.filter((item) => item.id !== postToDelete),
        );
        toast({
          title: "Post deleted",
          description: "Your post has been successfully deleted.",
          variant: "success",
        });
      } else {
        throw new Error(response.data.message || "Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePostChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    if (content.length <= 280) {
      setPostContent(content);
    }
  };

  const handlePostSubmit = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const response = await axiosInstance.post(
        "/feed",
        { content: postContent },
        { withCredentials: true },
      );
      if (response.data.success) {
        setPostContent("");
        fetchFeedItems();
        toast({
          title: "Post created",
          description: "Your post has been successfully created.",
          variant: "success",
        });
      } else {
        throw new Error(response.data.message || "Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchFeedItems = async (cursorParam: string | null = null) => {
    if (!user) return;

    try {
      setIsFetchingMore(true);
      const response = await axiosInstance.get(
        `/feed?limit=${ITEMS_PER_PAGE}${cursorParam ? `&cursor=${cursorParam}` : ""}`,
        {
          withCredentials: true,
        },
      );
      if (response.data.success) {
        const newItems = response.data.body.feeds;
        setFeedItems((prevItems) =>
          cursorParam ? [...prevItems, ...newItems] : newItems,
        );
        setCursor(response.data.body.cursor);
        setHasMore(!!response.data.body.cursor);
      } else {
        throw new Error(response.data.message || "Failed to fetch feed items");
      }
    } catch (error) {
      console.error("Error fetching feed items:", error);
      toast({
        title: "Error",
        description: "Failed to fetch feed items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFetchingMore(false);
      setIsLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const response = await axiosInstance.get("/profile/" + user.userId, {
        withCredentials: true,
      });
      if (response.data.success) {
        setUserProfile(response.data.body);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch user profile",
        );
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast({
        title: "Error",
        description: "Failed to fetch user profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const lastFeedItemCallback = useCallback(
    (node: HTMLDivElement) => {
      if (isFetchingMore) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchFeedItems(cursor);
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [isFetchingMore, hasMore, cursor, fetchFeedItems],
  );

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchFeedItems(null);
    } else {
      setIsLoading(false);
    }
  }, [user]);

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
      <main className="container mx-auto mt-14 flex-grow px-4 py-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {/* Left Sidebar - User Profile */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="mb-4">
                  <Avatar className="mx-auto h-24 w-24">
                    {userProfile ? (
                      <AvatarImage
                        src={
                          userProfile.profile_photo_path ||
                          "/placeholder.svg?height=96&width=96"
                        }
                        alt={`${userProfile.name}'s avatar`}
                      />
                    ) : (
                      <AvatarFallback>
                        <User className="h-12 w-12" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
                <CardTitle>
                  {userProfile ? userProfile.name : "Guest"}
                </CardTitle>
                <p className="text-sm text-gray-500">
                  {user ? user.email : "Please sign in"}
                </p>
              </CardHeader>
              <CardContent>
                {!user && (
                  <Button
                    className="mt-4 w-full"
                    onClick={() => navigate("/login")}
                  >
                    Sign In
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Middle - Feed Content */}
          <div className="md:col-span-2">
            {user ? (
              <>
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <div className="mb-4 flex items-start space-x-4">
                      <Avatar>
                        <AvatarImage
                          src={
                            userProfile?.profile_photo_path ||
                            "/placeholder.svg?height=40&width=40"
                          }
                          alt={`${userProfile?.name}'s avatar`}
                        />
                        <AvatarFallback>
                          <User className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-grow">
                        <Textarea
                          placeholder="What's on your mind?"
                          value={postContent}
                          onChange={handlePostChange}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handlePostSubmit();
                            }
                          }}
                          className="w-full resize-none"
                          rows={3}
                        />
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {280 - postContent.length} characters remaining
                          </span>
                          <Button
                            onClick={handlePostSubmit}
                            disabled={postContent.length === 0}
                          >
                            <Send className="mr-2 h-4 w-4" />
                            Post
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Feed items */}
                {feedItems.map((item, index) => (
                  <Card
                    key={item.id}
                    className="mb-6"
                    ref={
                      index === feedItems.length - 1
                        ? lastFeedItemCallback
                        : null
                    }
                  >
                    <CardHeader className="relative">
                      <Link to={`/profile/${item.users.id}`}>
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage
                              src={
                                item.users.profile_photo_path ||
                                "/placeholder.svg?height=40&width=40"
                              }
                              alt={`${item.users.full_name} avatar`}
                            />
                            <AvatarFallback>
                              <User className="h-6 w-6" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-sm font-semibold text-black">
                              {item.users.full_name}
                            </CardTitle>
                            <p className="text-xs text-gray-500">
                              Posted{" "}
                              {new Date(item.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </Link>

                      {user && user.userId === item.users.id && (
                        <div className="absolute right-4 top-4 flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditPost(item)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit post</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setPostToDelete(item.id);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                            <span className="sr-only">Delete post</span>
                          </Button>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      <Link to={`/feed/${item.id}`}>
                        {editingPost?.id === item.id ? (
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full resize-none"
                            rows={3}
                          />
                        ) : (
                          <p className="text-gray-700">{item.content}</p>
                        )}
                      </Link>
                    </CardContent>
                    {editingPost?.id === item.id && (
                      <CardFooter className="justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleSaveEdit}>
                          Save
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                ))}
                {isFetchingMore && (
                  <div className="my-4 flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  </div>
                )}
              </>
            ) : (
              <Card className="flex flex-col items-center justify-center p-8 text-center">
                <LogIn className="mb-4 h-12 w-12 text-gray-400" />
                <CardTitle className="mb-2">Sign in to see your feed</CardTitle>
                <p className="mb-4 text-gray-600">
                  Connect with professionals and stay updated with the latest
                  posts.
                </p>
                <Button onClick={() => navigate("/login")}>Sign In</Button>
              </Card>
            )}
          </div>

          {/* Right Sidebar - Connection Recommendations */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add to your feed</CardTitle>
              </CardHeader>
              <CardContent>
                <p>This Feature has not been implemented.</p>
              </CardContent>
            </Card>
            <Footer />
          </div>
        </div>
      </main>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Feed;
