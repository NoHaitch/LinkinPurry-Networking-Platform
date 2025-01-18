import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Pencil, Trash2, User } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import axiosInstance from "@/api/axios";
import { toast } from "@/hooks/use-toast";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Feed {
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

function FeedPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { feedId } = useParams();
  const [feed, setFeed] = useState<Feed | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Feed | null>(null);
  const [editContent, setEditContent] = useState("");

  const fetchFeed = async () => {
    if (!user) return;

    try {
      const response = await axiosInstance.get("/feed/" + feedId, {
        withCredentials: true,
      });
      if (response.data.success) {
        setFeed(response.data.body);
      } else {
        throw new Error(response.data.message || "Failed to fetch post");
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      navigate("/404");
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

  const handleEditPost = (post: Feed) => {
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
        setFeed((prevFeed) => {
          if (prevFeed) {
            return { ...prevFeed, content: editContent };
          }
          return prevFeed;
        });
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

  const handleDelete = async () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!feedId) return;

    try {
      const response = await axiosInstance.delete(`/feed/${feedId}`, {
        withCredentials: true,
      });
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Feed deleted successfully.",
        });
        navigate("/"); // Redirect to home page after deletion
      } else {
        throw new Error(response.data.message || "Failed to delete feed");
      }
    } catch (error) {
      console.error("Error deleting feed:", error);
      navigate("/404");
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFeed();
      fetchUserProfile();
    }
  }, [user]);

  return (
    <div className="flex min-h-screen w-screen flex-col bg-gray-100">
      <Navbar />
      <main className="container mx-auto mt-14 max-w-6xl flex-grow px-4 py-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Left Sidebar - User Profile */}
          <div className="col-span-1">
            <Link to={`/profile/${feed?.users.id}`}>
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
            </Link>
          </div>

          {/* Middle - Feed Content */}
          <div className="col-span-2">
            {feed && (
              <Card className="mb-6">
                <CardHeader className="relative">
                  <Link to={`/profile/${feed.users.id}`}>
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage
                          src={
                            feed.users.profile_photo_path ||
                            "/placeholder.svg?height=40&width=40"
                          }
                          alt={`${feed.users.full_name} avatar`}
                        />
                        <AvatarFallback>
                          <User className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-sm font-semibold">
                          {feed.users.full_name}
                        </CardTitle>
                        <p className="text-xs text-gray-500">
                          Posted {new Date(feed.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Link>

                  {user && user.userId === feed.users.id && (
                    <div className="absolute right-4 top-4 flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditPost(feed)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit post</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          handleDelete();
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                        <span className="sr-only">Delete post</span>
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {editingPost?.id === feed.id ? (
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full resize-none"
                      rows={3}
                    />
                  ) : (
                    <p className="text-gray-700">{feed.content}</p>
                  )}
                </CardContent>
                {editingPost?.id === feed.id && (
                  <CardFooter className="justify-between">
                    <span className="text-sm text-gray-500">
                      {280 - editContent.length} characters remaining
                    </span>
                    <div className="space-x-2">
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
                    </div>
                  </CardFooter>
                )}
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />

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

export default FeedPage;
