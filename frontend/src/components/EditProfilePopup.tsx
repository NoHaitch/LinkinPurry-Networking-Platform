import { useState, useEffect } from "react";
import axiosInstance from "@/api/axios";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface EditProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  initialData: {
    name: string;
    username: string;
    profile_photo_path: string;
    work_history: string;
    skills: string;
  };
  onProfileUpdate: (updatedProfile: any) => void;
}

interface FormData {
  name: string;
  work_history: string;
  skills: string;
  username: string;
  profile_photo?: File | null;
}

export function EditProfilePopup({
  isOpen,
  onClose,
  userId,
  initialData,
  onProfileUpdate,
}: EditProfilePopupProps) {
  const [formData, setFormData] = useState<FormData>({
    name: initialData.name || "",
    username: initialData.username || "",
    work_history: initialData.work_history || "",
    skills: initialData.skills || "",
    profile_photo: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFormData({
      name: initialData.name || "",
      username: initialData.username || "",
      work_history: initialData.work_history || "",
      skills: initialData.skills || "",
      profile_photo: null,
    });
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5 MB.",
          variant: "destructive",
        });
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }
      setFormData((prev) => ({ ...prev, profile_photo: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const requestBody = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null) {
        if (key === "profile_photo" && value instanceof File) {
          requestBody.append(key, value, value.name);
        } else {
          requestBody.append(key, value as string);
        }
      }
    });

    for (const [key, value] of requestBody.entries()) {
      console.log(key, value);
    }

    try {
      const response = await axiosInstance.put(
        `/profile/${userId}`,
        requestBody,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        },
      );

      if (response.data.success) {
        onProfileUpdate(response.data.body);
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
          variant: "success",
        });
        onClose();
      } else {
        throw new Error(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="profile_photo" className="text-right">
                Photo
              </Label>
              <Input
                id="profile_photo"
                name="profile_photo"
                type="file"
                onChange={handleFileChange}
                className="col-span-3"
                accept="image/*"
                max="5242880"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="work_history" className="text-right">
                Work History
              </Label>
              <Textarea
                id="work_history"
                name="work_history"
                value={formData.work_history}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Separate entries with commas"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="skills" className="text-right">
                Skills
              </Label>
              <Textarea
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Separate skills with commas"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Profile"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
