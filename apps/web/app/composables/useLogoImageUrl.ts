import { StorageBucket } from "@esposter/db-schema";

export const useLogoImageUrl = () => {
  const assetsBaseUrl = usePublicAssetsBaseUrl();
  return `${assetsBaseUrl}/${StorageBucket.PublicAppAssets}/logo.png`;
};
