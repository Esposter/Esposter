import { RESOURCE_ASSETS_URL_PREFIX } from "#shared/services/resource/constants";
import { encodeUrlSubDelimiters } from "@esposter/shared";

const encodeSegment = (segment: string) => encodeUrlSubDelimiters(encodeURIComponent(segment));

export const getResourceAssetUrl = (blobName: string) =>
  `${RESOURCE_ASSETS_URL_PREFIX}/${blobName.split("/").map(encodeSegment).join("/")}`;
