import webpush from "web-push";

export default defineNitroPlugin(() => {
  const runtimeConfig = useRuntimeConfig();
  const hostname = new URL(runtimeConfig.app.baseURL).hostname;
  webpush.setVapidDetails(
    `mailto:no-reply@${hostname}`,
    runtimeConfig.public.vapid.publicKey,
    runtimeConfig.vapid.privateKey,
  );
});
