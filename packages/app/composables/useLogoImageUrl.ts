import { env } from "@/env.client";
import { LOGO_IMAGE_PATH } from "@/services/esposter/constants";

export const useLogoImageUrl = () => `${env.NUXT_PUBLIC_AZURE_BLOB_URL}${LOGO_IMAGE_PATH}`;
