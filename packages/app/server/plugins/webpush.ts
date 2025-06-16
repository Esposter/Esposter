import { IS_PRODUCTION } from "#shared/util/environment/constants";
import webpush from "web-push";

export default defineNitroPlugin(() => {
  const runtimeConfig = useRuntimeConfig();
  if (!IS_PRODUCTION || new URL(runtimeConfig.public.baseUrl).protocol !== "https:") return;
  webpush.setVapidDetails(
    runtimeConfig.public.baseUrl,
    runtimeConfig.public.vapid.publicKey,
    runtimeConfig.vapid.privateKey,
  );
});
