import { SITE_NAME } from "@/services/esposter/constants";
import { AzureContainer } from "@/shared/models/azure/blob/AzureContainer";

export const useLogoImageUrl = () => {
  const runtimeConfig = useRuntimeConfig();
  return `${runtimeConfig.public.azure.blobUrl}/${AzureContainer.EsposterAssets}/${SITE_NAME}/logo.png`;
};
