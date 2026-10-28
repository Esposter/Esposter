import { AzureContainer } from "@esposter/db-schema";

export const useLogoImageUrl = () => {
  const containerBaseUrl = useContainerBaseUrl();
  return `${containerBaseUrl}/${AzureContainer.PublicAppAssets}/logo.png`;
};
