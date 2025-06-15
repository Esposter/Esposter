import webpush from "web-push";

export default defineNitroPlugin(() => {
  const runtimeConfig = useRuntimeConfig();
  const hostname = new URL(runtimeConfig.public.baseUrl).hostname;
  webpush.setVapidDetails(
    `mailto:no-reply@${hostname}`,
    runtimeConfig.public.vapid.publicKey,
    runtimeConfig.vapid.privateKey,
  );
});
