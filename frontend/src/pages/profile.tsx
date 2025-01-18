import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Loader2,
  Briefcase,
  Code,
  Users,
  Edit,
  Lock,
  UserPlus,
  UserMinus,
  Clock,
  Send,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { EditProfilePopup } from "@/components/EditProfilePopup";

import { useAuth } from "@/hooks/useAuth";
import axiosInstance from "@/api/axios";

interface Profile {
  id: string;
  name: string;
  username: string;
  profile_photo_path: string | null;
  work_history: string | null;
  skills: string | null;
  relevant_posts: { content: string }[] | null;
  connection_count: number;
  isOwner: boolean;
  isConnected: boolean;
  connectionStatus: string;
}

interface User {
  id: string;
  full_name: string;
  profile_photo_path: string;
  isConnected: boolean;
  isSecondDegree: boolean;
  isThirdDegree: boolean;
  isOwner: boolean;
}

interface UsersResponse {
  success: boolean;
  message: string;
  body: User[];
  error: string;
}
export function Profile() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [degree, setDegree] = useState("");
  const [recommendation, setRecommendation] = useState<User[]>([]);
  const fetchRecommendations = useCallback(
    async (userId: string, take: string = "5") => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get<UsersResponse>(
          `/connection/recommendations?take=${take}&targetId=${userId}`,
        );
        if (response.data.success) {
          setRecommendation(response.data.body);
        } else {
          throw new Error(response.data.message || "Failed to fetch users");
        }
      } catch (err) {
        setError("Failed to fetch users. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );
  const acceptInvitation = useCallback(async () => {
    try {
      const response = await axiosInstance.post(
        `/connection/${userId}/respond`,
        { action: "accept" },
        { withCredentials: true },
      );
      if (response.data.success) {
        await fetchProfile();
      }
    } catch (error) {
      setError("An error occurred while accepting the request");
    }
  }, []);

  const sendInvitation = useCallback(async () => {
    try {
      const response = await axiosInstance.post(
        `/connection/${userId}/request`,
        { withCredentials: true },
      );
      if (response.data.success) {
        await fetchProfile();
      }
    } catch (error) {
      setError("An error occurred while sending the request");
    }
  }, []);

  const removeConnection = useCallback(async () => {
    try {
      const response = await axiosInstance.delete(`/connection/${userId}`, {
        withCredentials: true,
      });
      if (response.data.success) {
        await fetchProfile();
      }
    } catch (error) {
      setError("An error occurred while removing the connection");
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/profile/${userId}`);
      if (response.data.success) {
        setProfile(response.data.body);
      } else {
        if (response.status === 404) {
          navigate("/404");
          return;
        }
        setError(response.data.message || "Failed to fetch profile");
      }
    } catch (error) {
      setError("An error occurred while fetching the profile");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const fetchConnectionDegree = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/connection-degree/${userId}`);
      if (response.data.success) {
        setDegree(response.data.body.degree);
      } else {
        if (response.status === 404) {
          navigate("/404");
          return;
        }
        setError(response.data.message || "Failed to fetch degree");
      }
    } catch (error) {
      setError("An error occurred while fetching the degree");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const handleProfileUpdate = useCallback(
    (updatedProfile: Profile) => {
      setProfile(updatedProfile);
      fetchProfile();
    },
    [fetchProfile],
  );

  const renderPlaceholder = useCallback(
    (message: string, type: "not_logged_in" | "not_connected" | "empty") => (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex h-40 items-center justify-center rounded-lg bg-gray-100 p-4"
      >
        {type === "not_logged_in" && (
          <div className="text-center">
            <Lock className="mx-auto mb-2 h-8 w-8 text-gray-400" />
            <p className="mb-2 text-gray-500">{message}</p>
            <Button asChild size="sm">
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        )}
        {type === "not_connected" && (
          <div className="text-center">
            <UserPlus className="mx-auto mb-2 h-8 w-8 text-gray-400" />
            <p className="mb-2 text-gray-500">{message}</p>
            <Button size="sm">Connect</Button>
          </div>
        )}
        {type === "empty" && <p className="text-gray-500">{message}</p>}
      </motion.div>
    ),
    [],
  );

  const renderProfileSection = useCallback(
    (title: string, icon: React.ReactNode, content: React.ReactNode) => (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {icon}
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>
    ),
    [],
  );

  const renderProfileActions = useCallback(() => {
    if (!profile) return null;
    if (profile.isOwner) {
      return (
        <Button
          variant="outline"
          className="ml-auto rounded-full border-[#0a66c2] bg-white font-medium text-[#0a66c2] hover:border-[#004182] hover:bg-[#f3f6f8] hover:text-[#004182]"
          onClick={() => setIsEditProfileOpen(true)}
        >
          <Edit className="mr-2 h-4 w-4" /> Edit Profile
        </Button>
      );
    }
    if (user && profile.isConnected) {
      return (
        <div className="ml-auto flex gap-4">
          <Button
            onClick={removeConnection}
            variant="outline"
            className="ml-auto rounded-full border-red-700 bg-white font-medium text-red-700 hover:border-red-800 hover:bg-[#f3f6f8] hover:text-red-800"
          >
            <UserMinus className="mr-2 h-4 w-4" /> Unconnect
          </Button>
          <Link to={"/messaging/" + profile.id}>
            <Button
              variant="outline"
              className="ml-auto rounded-full border-[#0a66c2] bg-white font-medium text-[#0a66c2] hover:border-[#004182] hover:bg-[#f3f6f8] hover:text-[#004182]"
            >
              <Send className="mr-2 h-4 w-4" /> Message
            </Button>
          </Link>
        </div>
      );
    }
    if (user && profile.connectionStatus === "received") {
      return (
        <Button
          onClick={acceptInvitation}
          variant="outline"
          className="ml-auto rounded-full border-[#0a66c2] bg-white font-medium text-[#0a66c2] hover:border-[#004182] hover:bg-[#f3f6f8] hover:text-[#004182]"
        >
          <UserPlus className="mr-2 h-4 w-4" /> Accept
        </Button>
      );
    }
    if (user && profile.connectionStatus === "none") {
      return (
        <Button
          onClick={sendInvitation}
          variant="outline"
          className="ml-auto rounded-full border-[#0a66c2] bg-white font-medium text-[#0a66c2] hover:border-[#004182] hover:bg-[#f3f6f8] hover:text-[#004182]"
        >
          <UserPlus className="mr-2 h-4 w-4" /> Connect
        </Button>
      );
    }
    if (user) {
      return (
        <Button
          variant="outline"
          className="ml-auto rounded-full border-[#666666] font-medium text-[#666666] hover:border-[#191919] hover:bg-[#f3f2f1] hover:text-[#191919]"
          disabled
        >
          <Clock className="mr-2 h-4 w-4" /> Invitation Pending
        </Button>
      );
    }
    return null;
  }, [profile, user]);

  useEffect(() => {
    fetchProfile();
    fetchConnectionDegree();
    fetchRecommendations(userId as string);
  }, [userId]);

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

  if (error || !profile) {
    return (
      <motion.div
        key="error"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex h-screen items-center justify-center"
      >
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-lg font-semibold text-red-500">
              {error || "Profile not found"}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="mt-12 flex min-h-screen w-screen">
      <Navbar />
      <div className="flex flex-1">
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 gap-6 md:grid-cols-3"
            >
              <div className="col-span-2">
                {/* Profile Section */}
                <Card className="relative mb-6 overflow-hidden">
                  <img
                    className="absolute z-10 h-32 w-full"
                    alt="banner"
                    src="/image/background-image.webp"
                  />
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center space-x-4 md:block">
                      <Avatar className="mt-10 flex h-28 w-28 items-center">
                        <AvatarImage
                          className="z-10"
                          src={profile.profile_photo_path || undefined}
                          alt={profile.name}
                        />
                        <AvatarFallback>
                          {profile.name
                            ? profile.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                            : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <h1 className="text-2xl font-bold">
                        {profile.name || "No Name"}
                      </h1>
                      <p className="text-sm text-gray-500">
                        {profile.username} {degree ? "• " + degree : ""}
                      </p>
                      <div className="mt-2 flex flex-1 flex-col items-center justify-center space-y-2 md:flex-row md:space-y-0">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <Link to={"/connection/" + userId}>
                            <span className="text-sm text-gray-500">
                              {profile.connection_count} connections
                            </span>
                          </Link>
                        </div>
                        {renderProfileActions()}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Work History Section */}
                {renderProfileSection(
                  "Work History",
                  <Briefcase className="h-5 w-5" />,
                  profile.work_history ? (
                    <motion.ul
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="list-inside list-disc space-y-2"
                    >
                      {profile.work_history.split(",").map((job, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          {job.trim()}
                        </motion.li>
                      ))}
                    </motion.ul>
                  ) : (
                    renderPlaceholder(
                      profile.isOwner
                        ? "Add your work history"
                        : "No work history available",
                      "empty",
                    )
                  ),
                )}

                {/* Skills Section */}
                {renderProfileSection(
                  "Skills",
                  <Code className="h-5 w-5" />,
                  profile.skills ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-wrap gap-2"
                    >
                      {profile.skills.split(",").map((skill, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Badge variant="secondary">{skill.trim()}</Badge>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    renderPlaceholder(
                      profile.isOwner ? "Add your skills" : "No skills listed",
                      "empty",
                    )
                  ),
                )}

                {/* Relevant Posts Section */}
                {renderProfileSection(
                  "Recent Posts",
                  null,
                  !user ? (
                    renderPlaceholder(
                      "Sign in to view recent posts",
                      "not_logged_in",
                    )
                  ) : profile.relevant_posts &&
                    profile.relevant_posts.length > 0 ? (
                    <motion.ul
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      {profile.relevant_posts.map((post, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border-b pb-4 last:border-b-0 last:pb-0"
                        >
                          <p className="text-sm text-gray-600">
                            {post.content}
                          </p>
                        </motion.li>
                      ))}
                    </motion.ul>
                  ) : (
                    renderPlaceholder(
                      profile.isOwner
                        ? "Share your first post"
                        : "No recent posts available",
                      "empty",
                    )
                  ),
                )}
              </div>

              {/* Recomendation Section */}
              <div className="col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>People You May Know</CardTitle>
                  </CardHeader>
                  {recommendation?.map((user) => (
                    <Link key={user.id} to={"/profile/" + user.id}>
                      <CardContent className="flex items-center gap-2">
                        <Avatar className="mr-2 flex h-10 w-10 items-center">
                          <AvatarImage
                            className="z-10"
                            src={user.profile_photo_path || undefined}
                            alt={user.full_name}
                          />
                          <AvatarFallback>
                            {user.full_name
                              ? user.full_name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                              : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <p>{user.full_name}</p>
                        <p className="text-xs">
                          {user.isConnected
                            ? "1st"
                            : user.isSecondDegree
                              ? "2nd"
                              : user.isThirdDegree
                                ? "3rd"
                                : ""}
                        </p>
                      </CardContent>
                    </Link>
                  ))}
                </Card>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
      {profile.isOwner && (
        <EditProfilePopup
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          userId={userId!}
          initialData={{
            name: profile.name,
            username: profile.username,
            profile_photo_path: profile.profile_photo_path || "",
            work_history: profile.work_history || "",
            skills: profile.skills || "",
          }}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
}

export default Profile;
