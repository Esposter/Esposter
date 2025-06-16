import { IS_PRODUCTION } from "#shared/util/environment/constants";
import webpush from "web-push";

export default defineNitroPlugin(() => {
  if (!IS_PRODUCTION) return;
  const runtimeConfig = useRuntimeConfig();
  webpush.setVapidDetails(
    runtimeConfig.public.baseUrl,
    runtimeConfig.public.vapid.publicKey,
    runtimeConfig.vapid.privateKey,
  );
});
