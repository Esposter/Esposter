import { AZURE_BLOB_URL_DEV, AZURE_BLOB_URL_PROD } from "@/util/constants.common";

export const useLogoImageUrl = () => {
  const isProd = useIsProd();
  return isProd ? AZURE_BLOB_URL_PROD : AZURE_BLOB_URL_DEV;
};
