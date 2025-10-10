import { getIsProduction } from "@esposter/shared";
import webpush from "web-push";

export default defineNitroPlugin(() => {
  const runtimeConfig = useRuntimeConfig();
  if (!(getIsProduction() && new URL(runtimeConfig.public.baseUrl).protocol === "https:")) return;
  webpush.setVapidDetails(
    runtimeConfig.public.baseUrl,
    runtimeConfig.public.vapid.publicKey,
    runtimeConfig.vapid.privateKey,
  );
});
