import { definePlugin } from "nitro";
import { useRuntimeConfig } from "nuxt/server";
import webpush from "web-push";

export default definePlugin(() => {
  const runtimeConfig = useRuntimeConfig();
  // BASE_URL is unavailable during prerender and may be malformed when misconfigured
  if (!URL.canParse(runtimeConfig.public.baseUrl) || new URL(runtimeConfig.public.baseUrl).hostname === "localhost")
    return;
  webpush.setVapidDetails(
    runtimeConfig.public.baseUrl,
    runtimeConfig.public.vapid.publicKey,
    runtimeConfig.vapid.privateKey,
  );
});
