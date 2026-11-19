import { RESOURCE_ASSETS_URL_PREFIX } from "#shared/services/resource/constants";

// The one address a note's image may hold: a resource asset url, which every upload returns. Shared by the paste rule
// That keeps an image only at it and the published view that shows an image only at it, so the two cannot disagree
export const NOTE_IMAGE_SOURCE_REGEX = new RegExp(`^${RegExp.escape(RESOURCE_ASSETS_URL_PREFIX)}/`, "u");
