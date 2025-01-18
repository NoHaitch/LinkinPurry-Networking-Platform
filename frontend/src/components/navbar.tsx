import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  Users,
  MessageSquare,
  UserPlus,
  LogOut,
  User,
  Menu,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import axiosInstance from "@/api/axios";

const getNavItems = (isLoggedIn: boolean) => {
  const baseItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: UserPlus, label: "People", href: "/people" },
  ];

  const loggedInItems = [
    { icon: Users, label: "My Network", href: "/connection" },
    { icon: MessageSquare, label: "Messaging", href: "/messaging" },
  ];

  return isLoggedIn ? [...baseItems, ...loggedInItems] : baseItems;
};

export function Navbar() {
  const { user, logout } = useAuth();
  const isLoggedIn = !!user;
  const navItems = getNavItems(isLoggedIn);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logout Succesfull",
      variant: "success",
    });
  };

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex flex-shrink-0 items-center">
            <img
              src="/image/logo.png"
              alt="LinkInPurry Logo"
              className="mr-2 h-8 w-8"
            />
            <span className="text-xl font-bold text-blue-600 md:text-2xl">
              LinkInPurry
            </span>
          </Link>
          <div className="flex items-center">
            <div className="hidden items-center gap-4 text-gray-600 md:flex">
              {navItems.map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
            </div>
            <div className="m-2 hidden h-9 w-[2px] bg-muted md:block"></div>
            {!isLoggedIn ? (
              <div className="flex items-center">
                <Link
                  to="/login"
                  className="rounded-full border border-gray-400 px-4 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 md:text-sm"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="ml-1 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 md:ml-3 md:text-sm"
                >
                  Join now
                </Link>
              </div>
            ) : (
              <UserMenu user={user} logout={handleLogout} />
            )}
            <div className="ml-2 text-gray-600 md:hidden">
              <MobileMenu navItems={navItems} />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavItem({
  icon: Icon,
  label,
  href,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
}) {
  return (
    <Link
      to={href}
      className="flex flex-col items-center justify-center rounded-md px-3 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 focus:outline-none"
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}

function UserMenu({ user, logout }: { user: any; logout: () => void }) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axiosInstance.get("/profile/" + user.userId, {
          withCredentials: true,
        });
        if (response.data.success) {
          setAvatarUrl(response.data.body.profile_photo_path);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, [user.userId]);

  return (
    <div className="flex flex-col items-center gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-auto items-center justify-center"
          >
            <div className="flex flex-col items-center justify-center">
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={avatarUrl || "/image/user_profile.png"}
                  alt="User avatar"
                />
                <AvatarFallback>
                  {user.name ? (
                    user.name.charAt(0).toUpperCase()
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="flex h-auto gap-0">
                Me
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuItem>
            <div className="flex flex-col">
              <span className="font-semibold">{user.name}</span>
              <span className="text-sm text-gray-500">{user.email}</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link
              to={`/profile/${user.userId}`}
              className="flex items-center text-black"
            >
              <User className="mr-2 h-4 w-4" />
              <span>View Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function MobileMenu({
  navItems,
}: {
  navItems: Array<{ icon: React.ElementType; label: string; href: string }>;
}) {
  return (
    <div className="flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open menu">
            <Menu className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          {navItems.map((item) => (
            <DropdownMenuItem key={item.href} asChild>
              <Link to={item.href} className="flex items-center text-black">
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
