import baseWebpush from "web-push";

baseWebpush.setVapidDetails(process.env.BASE_URL, process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);

export const webpush: typeof baseWebpush = baseWebpush;
