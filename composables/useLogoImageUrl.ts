import { LOGO_IMAGE_PATH } from "@/util/constants.client";

export const useLogoImageUrl = () => {
  const config = useRuntimeConfig();
  return `${config.public.azureBlobUrl}${LOGO_IMAGE_PATH}`;
};
