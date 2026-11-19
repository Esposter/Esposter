import { MimeType } from "#shared/models/file/MimeType";
import { RESOURCE_ASSETS_URL_PREFIX } from "#shared/services/resource/constants";

// The images a user puts into the app, shared by the note picker's accept list, the paste and drop handler, and the
// Uploads of a profile image, room image, room emoji and call background, so one list decides all of them. SVG is not
// Among them: an SVG served from the public assets host can carry script
export const NOTE_IMAGE_MIME_TYPES: string[] = [MimeType.Gif, MimeType.Jpeg, MimeType.Png, MimeType.Webp];

// The one address a note's image may hold: a resource asset url, which every upload returns. Shared by the paste rule
// That keeps an image only at it and the published view that shows an image only at it, so the two cannot disagree
export const NOTE_IMAGE_SOURCE_REGEX = new RegExp(`^${RegExp.escape(RESOURCE_ASSETS_URL_PREFIX)}/`, "u");
