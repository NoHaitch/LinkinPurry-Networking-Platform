import React, { createContext, useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { jwtDecode } from "jwt-decode";
import { getPushSubscription } from "@/lib/push";
import { toast } from "@/hooks/use-toast";
import axiosInstance from "@/api/axios";
import { useNavigate } from "react-router-dom";

interface User {
  userId: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [cookies, , removeCookie] = useCookies(["token"]);

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate()
  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoggingOut && cookies.token) {
        setUser(jwtDecode(cookies.token));
      } else {
        setUser(null);
      }
    };

    checkAuth();
  }, [cookies, isLoggingOut]);

  const logout = async () => {
    try {
      const { endpoint } = (await getPushSubscription()) as any;
      await axiosInstance.delete("/push/subscription", {
        data: {endpoint},
      });
      setIsLoggingOut(true);
      removeCookie("token", { path: "/" });
      setUser(null);
      setIsLoggingOut(false);
      navigate('/login')
    } catch (error: any) {
      console.log(error);
      toast({
        title: "Logout Failed. Please try again later",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
