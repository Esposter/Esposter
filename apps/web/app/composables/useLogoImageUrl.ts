import { StorageBucket } from "@esposter/db-schema";

export const useLogoImageUrl = () => {
  const assetsBaseUrl = useRuntimeConfig().public.publicAssets.baseUrl;
  return `${assetsBaseUrl}/${StorageBucket.PublicAppAssets}/logo.png`;
};
