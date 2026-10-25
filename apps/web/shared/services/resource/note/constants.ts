import { MimeType } from "#shared/models/file/MimeType";
import { RESOURCE_ASSETS_URL_PREFIX } from "#shared/services/resource/constants";

// The images a note takes, shared by the picker's accept list and the paste and drop handler, so one list decides both
export const NOTE_IMAGE_MIME_TYPES: string[] = [MimeType.Gif, MimeType.Jpeg, MimeType.Png, MimeType.Webp];

// The one address a note's image may hold: a resource asset url, which every upload returns. Shared by the paste rule
// That keeps an image only at it and the published view that shows an image only at it, so the two cannot disagree
export const NOTE_IMAGE_SOURCE_REGEX = new RegExp(`^${RegExp.escape(RESOURCE_ASSETS_URL_PREFIX)}/`, "u");
