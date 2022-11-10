import { AZURE_BLOB_URL_DEV, AZURE_BLOB_URL_PROD, LOGO_IMAGE_PATH } from "@/util/constants.client";

export const useLogoImageUrl = () => {
  const isProd = useIsProd();
  return `${isProd ? AZURE_BLOB_URL_PROD : AZURE_BLOB_URL_DEV}${LOGO_IMAGE_PATH}`;
};
