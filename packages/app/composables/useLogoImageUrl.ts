import { AzureContainer } from "@/shared/models/azure/blob/AzureContainer";
import { SITE_NAME } from "@/shared/services/esposter/constants";

export const useLogoImageUrl = () => {
  const runtimeConfig = useRuntimeConfig();
  return `${runtimeConfig.public.azure.blobUrl}/${AzureContainer.EsposterAssets}/${SITE_NAME}/logo.png`;
};
