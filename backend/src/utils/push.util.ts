import * as webpush from "web-push";
import { VAPID_MAILTO, VAPID_PRIVATE_KEY, VAPID_PUBLIC_KEY } from "../config";

webpush.setVapidDetails(
    'mailto:' + VAPID_MAILTO,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY,
)

export interface PushData {
    title: string;
    body: string;
    icon?: string;
    url?: string;
    tag?: string;
}

export async function sendNotification(
  pushSubscription: webpush.PushSubscription,
  data: PushData,
  options?: { urgency?: webpush.Urgency }
): Promise<{ success: true; result: webpush.SendResult } | { success: false; error: webpush.WebPushError; endpoint: string }> {
    try {
        return {
            success: true,
            result: await webpush.sendNotification(
                pushSubscription,
                JSON.stringify(data),
                options
            ),
        };
    } catch (err) {
        if (err instanceof webpush.WebPushError) {
            console.log(err)
            return { success: false, error: err, endpoint: pushSubscription.endpoint };
        }
        throw err;
    }
}

export async function sendNotificationToAll(
  pushSubscriptions: webpush.PushSubscription[],
  data: PushData,
  options?: { urgency?: webpush.Urgency }
) {
    return await Promise.allSettled(
        pushSubscriptions.map(
            async (pushSubscription) => await sendNotification(pushSubscription, data, options)
        )
    );
}
