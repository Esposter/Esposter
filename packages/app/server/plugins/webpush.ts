import webpush from "web-push";

export default defineNitroPlugin(() => {
  const runtimeConfig = useRuntimeConfig();
  if (new URL(runtimeConfig.public.baseUrl).hostname === "localhost") return;
  webpush.setVapidDetails(
    runtimeConfig.public.baseUrl,
    runtimeConfig.public.vapid.publicKey,
    runtimeConfig.vapid.privateKey,
  );
});
