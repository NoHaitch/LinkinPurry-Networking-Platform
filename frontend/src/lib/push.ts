import axiosInstance from "@/api/axios";

// Function to subscribe the user
export async function subscribeToPushNotifications() {
    const swRegistration = await navigator.serviceWorker.ready;
    const applicationServerKey = import.meta.env.VITE_VAPID_KEY as string; 
    const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true, 
        applicationServerKey: applicationServerKey
    });

    await axiosInstance.post('/push/subscription', 
        subscription
    );
}

export const getPushSubscription = async () => {
    const swRegistration = await navigator.serviceWorker.ready;
    return await swRegistration.pushManager.getSubscription();
};