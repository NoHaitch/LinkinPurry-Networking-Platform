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
import { toast } from "@/hooks/use-toast";
import axiosInstance from "@/api/axios";

// Interface type for register response
interface RegistrationResponse {
  success: boolean;
  message: string;
  body: {
    token: string;
  };
  error: string;
}

// Register Page
export default function Register() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  // Redirect if user is logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // validate form inputs
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // on submit function
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await axiosInstance.post<RegistrationResponse>(
          "/register",
          formData,
          { withCredentials: true },
        );

        if (response.data.success) {
          const token = response.data.body.token;
          setUser(jwtDecode(token)); // decode and set user data
          toast({
            title: "Registration Successful",
            description: "You are now logged in.",
            variant: "success",
          });
          navigate("/");
        } else {
          setErrors({
            general: response.data.message || "Registration failed",
          });
          toast({
            title: "Registration Failed",
            description: response.data.message,
            variant: "destructive",
          });
        }
      } catch (error) {
        if (error instanceof AxiosError && error.response) {
          setErrors({
            general: error.response.data.error || "Registration failed",
          });
          toast({
            title: "Registration Failed",
            description: error.response.data.error,
            variant: "destructive",
          });
        } else {
          setErrors({ general: "An error occurred. Please try again." });
          toast({
            title: "Registration Failed",
            description: "An error occurred. Please try again.",
            variant: "destructive",
          });
        }
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
          <CardHeader className="p-4">
            <CardTitle className="flex flex-col gap-1 text-center">
              <h1 className="text-3xl">Sign Up</h1>
              <p className="font-light">Make the most of your agent life.</p>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <p className="text-sm text-red-500">{errors.general}</p>
              )}
              {["username", "email", "name"].map((field) => (
                <div key={field} className="">
                  <Label htmlFor={field}>
                    {field === "name"
                      ? "Full Name"
                      : field.charAt(0).toUpperCase() + field.slice(1)}
                  </Label>
                  <Input
                    id={field}
                    name={field}
                    type={field === "email" ? "email" : "text"}
                    required
                    autoComplete="on"
                    value={formData[field as keyof typeof formData]}
                    onChange={handleInputChange}
                  />
                  {errors[field] && (
                    <p className="text-sm text-red-500">{errors[field]}</p>
                  )}
                </div>
              ))}
              {["password", "confirmPassword"].map((field) => (
                <div key={field} className="">
                  <Label htmlFor={field}>
                    {field === "password"
                      ? "Password (6+ characters)"
                      : "Confirm Password"}
                  </Label>
                  <div className="relative">
                    <Input
                      id={field}
                      name={field}
                      type={
                        field === "password"
                          ? showPassword
                            ? "text"
                            : "password"
                          : showConfirmPassword
                            ? "text"
                            : "password"
                      }
                      autoComplete="on"
                      required
                      className="w-full pr-20"
                      value={formData[field as keyof typeof formData]}
                      onChange={handleInputChange}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="absolute right-0 top-0 h-full px-3 text-blue-600 hover:text-blue-700"
                      onClick={() =>
                        field === "password"
                          ? setShowPassword(!showPassword)
                          : setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {(
                        field === "password"
                          ? showPassword
                          : showConfirmPassword
                      ) ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="ml-2">Show</span>
                    </Button>
                  </div>
                  {errors[field] && (
                    <p className="text-sm text-red-500">{errors[field]}</p>
                  )}
                </div>
              ))}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                Create Account
              </Button>
              <p className="mt-4 text-center text-sm">
                Already on LinkInPurry?{" "}
                <Link to="/login" className="text-blue-600 hover:underline">
                  Sign in
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
