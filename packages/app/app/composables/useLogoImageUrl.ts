import { AzureContainer } from "@esposter/db-schema";

export const useLogoImageUrl = () => {
  const runtimeConfig = useRuntimeConfig();
  return `${runtimeConfig.public.azure.container.baseUrl}/${AzureContainer.AppAssets}/logo.png`;
};
