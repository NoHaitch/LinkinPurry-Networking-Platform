import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
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

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}
