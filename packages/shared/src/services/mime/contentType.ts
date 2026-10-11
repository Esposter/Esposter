import { CHARSET_PARAMETER_REGEXP } from "#src/services/mime/constants";
import { charset } from "#src/services/mime/charset";
import { lookup } from "#src/services/mime/lookup";

// A full Content-Type header for an extension or a media type, with the media type's charset attached unless it has
// One already
export const contentType = (value: string): string | false => {
  // Anything with a slash is already a media type, and anything else is an extension
  const mediaType = value.includes("/") ? value : lookup(value);
  if (!mediaType) return false;
  if (CHARSET_PARAMETER_REGEXP.test(mediaType)) return mediaType;

  const mediaCharset = charset(mediaType);
  return mediaCharset ? `${mediaType}; charset=${mediaCharset.toLowerCase()}` : mediaType;
};
