import { setVapidDetails } from "web-push";

export default defineNitroPlugin(() => {
  setVapidDetails("mailto:no-reply@esposter.com", process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
});
