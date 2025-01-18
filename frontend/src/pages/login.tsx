import { useState, FormEvent, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { AxiosError } from "axios";
import { jwtDecode } from "jwt-decode";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Footer from "@/components/footer";

import { useAuth } from "@/hooks/useAuth";
import axiosInstance from "@/api/axios";
import { toast } from "@/hooks/use-toast";
import { subscribeToPushNotifications } from "@/lib/push";

// Interface type for login response
interface LoginResponse {
  success: boolean;
  message: string;
  body: {
    token: string;
  };
  error: string;
}

// Login Page
export default function Login() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  // Redirect if user is logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors({});
  };

  // on submit function
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    // check if username or email input is empty
    if (!formData.identifier.trim()) {
      setErrors((prev) => ({
        ...prev,
        identifier: "Email/Username is required",
      }));
      return;
    }

    // check if password input is empty
    if (!formData.password) {
      setErrors((prev) => ({ ...prev, password: "Password is required" }));
      return;
    }

    try {
      // login request
      const response = await axiosInstance.post<LoginResponse>(
        "/login",
        {
          identifier: formData.identifier,
          password: formData.password,
        },
        { withCredentials: true },
      );

      if (response.data.success) {
        const token = response.data.body.token;
        setUser(jwtDecode(token));
        toast({
          title: "Successful",
          description: "You are now logged in.",
          variant: "success",
        });

        if ("Notification" in window && navigator.serviceWorker) {
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              console.log("Notification permission granted.");
              subscribeToPushNotifications();
            } else {
              console.log("Notification permission denied.");
            }
          });
        }

        navigate("/");
      } else {
        setErrors({ general: response.data.message || "Login failed" });
        toast({
          title: "Login Failed",
          description: "Wrong username or password!",
          variant: "destructive",
        });
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        setErrors({ general: error.response.data.message || "Login failed" });
        toast({
          title: "Login Failed",
          description: "Wrong username or password!",
          variant: "destructive",
        });
      } else {
        setErrors({ general: "An error occurred. Please try again." });
        toast({
          title: "Connection Failed",
          description: "Failed to connect. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex min-h-screen w-screen flex-col">
      <header className="pl-10 pt-8">
        <Link to="/" className="flex flex-shrink-0 items-center">
          <img
            src="/image/logo.png"
            alt="LinkInPurry Logo"
            className="mr-2 h-8 w-8"
          />
          <span className="text-2xl font-bold text-blue-600">LinkInPurry</span>
        </Link>
      </header>
      <main className="container mx-auto flex flex-grow items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex flex-col gap-2">
              <h1 className="text-3xl">Sign In</h1>
              <p className="font-light">Stay updated on your agent world.</p>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <p className="text-sm text-red-500">{errors.general}</p>
              )}
              <div className="space-y-2">
                <Label htmlFor="identifier">Email or Username</Label>
                <Input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="on"
                  required
                  value={formData.identifier}
                  onChange={handleInputChange}
                />
                {errors.identifier && (
                  <p className="text-sm text-red-500">{errors.identifier}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="on"
                    className="pr-20"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="absolute right-0 top-0 h-full px-3 text-blue-600 hover:text-blue-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="ml-2">Show</span>
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                Sign In
              </Button>

              <p className="mt-4 text-center text-sm">
                Don't have an account?{" "}
                <Link to="/register" className="text-blue-600 hover:underline">
                  Sign up
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </main>
      <div className="bg-white">
        <Footer />
      </div>
    </div>
  );
}
