import { LOGO_IMAGE_PATH } from "@/services/esposter/constants";

export const useLogoImageUrl = () => {
  const config = useRuntimeConfig();
  return `${config.public.azureBlobUrl}${LOGO_IMAGE_PATH}`;
};
