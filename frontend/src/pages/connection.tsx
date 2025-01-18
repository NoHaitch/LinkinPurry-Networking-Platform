import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import axiosInstance from "@/api/axios";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface Connection {
  id: string;
  full_name: string;
  profile_photo_path: string;
}

export default function Connections() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { userId: userIdRouter } = useParams();
  const navigate = useNavigate();

  const userId = userIdRouter || user?.userId;

  const fetchConnections = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await axiosInstance.get(
        `connection/${userId}/connections`,
      );
      setConnections(data.body);
      setError(null);
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        navigate("/401");
        return;
      } else if (error.response && error.response.status === 404) {
        navigate("/404");
        return;
      }
      setError("Failed to fetch connections. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to fetch connections. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, navigate]);

  const handleRemoveConnection = async (id: string) => {
    if (!userId) return;

    try {
      const response = await axiosInstance.delete(`/connection/${id}`);
      if (response.data.success) {
        toast({
          title: "Connection Removed",
          variant: "success",
        });
        fetchConnections();
      } else {
        throw new Error(response.data.message || "Failed to remove connection");
      }
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        navigate("/401");
        return;
      } else if (err.response && err.response.status === 404) {
        navigate("/404");
        return;
      }
      console.error("Error removing connection:", err);
      toast({
        title: "Removal Failed",
        description: "Failed to remove connection. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

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

  if (error) {
    return (
      <div className="flex min-h-screen w-screen flex-col">
        <Navbar />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="container mx-auto mb-20 mt-14 flex max-w-5xl items-center justify-center px-4 py-8"
        >
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <p className="text-lg font-semibold text-red-500">{error}</p>
            </CardContent>
          </Card>
        </motion.div>
        <Footer />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex min-h-screen w-screen flex-col">
        <Navbar />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="container mx-auto mb-20 mt-14 flex max-w-5xl items-center justify-center px-4 py-8"
        >
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <p className="text-lg font-semibold text-red-500">
                User not found. Please log in or provide a valid user ID.
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-screen flex-col">
      <Navbar />
      <main className="container mx-auto mb-12 mt-14 max-w-5xl px-4 pt-8 md:mb-20">
        <div className="rounded-lg bg-white shadow">
          <div className="space-y-4 border-b border-gray-200 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {connections.length} Connections
                </h1>
                <p className="text-sm text-gray-600">
                  View and manage your connections
                </p>
              </div>
              <Button
                variant="ghost"
                className="whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-700"
                onClick={() => navigate("/people")}
              >
                Add Connection
              </Button>
            </div>
          </div>

          <div className="divide-y">
            {connections.map((connection) => (
              <div
                key={connection.id}
                className="flex items-center justify-between p-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={connection.profile_photo_path}
                      alt={connection.full_name}
                    />
                    <AvatarFallback>
                      {connection.full_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Link to={"/profile/" + connection.id}>
                      <h3 className="cursor-pointer font-semibold text-gray-900 hover:text-blue-600 hover:underline">
                        {connection.full_name}
                      </h3>
                    </Link>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={"/messaging/" + connection.id}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                    >
                      Message
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <span className="sr-only">More options</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleRemoveConnection(connection.id)}
                      >
                        Remove connection
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <div className="mt-8 md:mt-2">
        <Footer />
      </div>
    </div>
  );
}
