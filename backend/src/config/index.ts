import { config } from 'dotenv';
config()

export const PORT = process.env.PORT as string;
export const SECRET_KEY = process.env.SECRET_KEY as string;
export const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY as string;
export const DATABASE_URL = process.env.DATABASE_URL as string;
export const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY as string;
export const VAPID_MAILTO = process.env.VAPID_MAILTO as string;
export const REDIS_URL = process.env.REDIS_URL as string;
export const DEFAULT_PROFILE = "https://1azo7nn58l8rzc41.public.blob.vercel-storage.com/user_profile-OvdRgF7XYY80qFtbyvQ1tTOYFOmOkv.png"