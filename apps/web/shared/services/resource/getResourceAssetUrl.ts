import { RESOURCE_ASSETS_URL_PREFIX } from "#shared/services/resource/constants";
import { encodeUrlSubDelimiters } from "@esposter/shared";

export const getResourceAssetUrl = (blobName: string) =>
  `${RESOURCE_ASSETS_URL_PREFIX}/${blobName
    .split("/")
    .map((segment) => encodeUrlSubDelimiters(encodeURIComponent(segment)))
    .join("/")}`;
