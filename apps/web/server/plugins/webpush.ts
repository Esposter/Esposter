import { definePlugin } from "nitro";
import * as webpush from "web-push";

export default definePlugin(() => {
  // A prerender runs at build time without the deployment's environment, and a local server has no public origin to
  // Register with push services
  if (import.meta.prerender || new URL(process.env.BASE_URL).hostname === "localhost") return;
  webpush.setVapidDetails(process.env.BASE_URL, process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
});
