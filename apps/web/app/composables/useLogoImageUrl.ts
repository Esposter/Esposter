import { StorageBucket } from "@esposter/db-schema";

export const useLogoImageUrl = () => {
  const containerBaseUrl = useContainerBaseUrl();
  return `${containerBaseUrl}/${StorageBucket.PublicAppAssets}/logo.png`;
};
