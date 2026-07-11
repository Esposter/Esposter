import webpush from "web-push";

export default defineNitroPlugin(() => {
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
