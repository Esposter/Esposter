import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";

export const useLogoImageUrl = () => {
  const runtimeConfig = useRuntimeConfig();
  return `${runtimeConfig.public.azure.blobUrl}/${AzureContainer.EsposterAssets}/logo.png`;
};
