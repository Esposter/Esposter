import { useIsProduction } from "@@/server/composables/useIsProduction";
import webpush from "web-push";

export default defineNitroPlugin(() => {
  const runtimeConfig = useRuntimeConfig();
  const isProduction = useIsProduction();
  if (!(isProduction && new URL(runtimeConfig.public.baseUrl).protocol === "https:")) return;
  webpush.setVapidDetails(
    runtimeConfig.public.baseUrl,
    runtimeConfig.public.vapid.publicKey,
    runtimeConfig.vapid.privateKey,
  );
});
