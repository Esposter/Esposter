import { LOGO_IMAGE_PATH } from "@/services/esposter/constants";

export const useLogoImageUrl = () => {
  const runtimeConfig = useRuntimeConfig();
  return `${runtimeConfig.public.azure.blobUrl}${LOGO_IMAGE_PATH}`;
};
