import webpush from "web-push";

export default defineNitroPlugin(() => {
  webpush.setVapidDetails("mailto:no-reply@esposter.com", process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
});
