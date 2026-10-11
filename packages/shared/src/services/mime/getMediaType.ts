import { MEDIA_TYPE_REGEX } from "#src/services/mime/constants";

// The media type a value leads with, so `text/html; charset=utf-8` reads as `text/html`
export const getMediaType = (value: string): string => MEDIA_TYPE_REGEX.exec(value)?.groups?.mediaType ?? "";
