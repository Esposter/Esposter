import { MEDIA_TYPE_REGEXP } from "#src/services/mime/constants";

// The media type a value leads with, so `text/html; charset=utf-8` reads as `text/html`
export const getMediaType = (value: string): string => MEDIA_TYPE_REGEXP.exec(value)?.groups?.mediaType ?? "";
