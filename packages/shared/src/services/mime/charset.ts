import { DEFAULT_TEXT_CHARSET, TEXT_MEDIA_TYPE_REGEX } from "#src/services/mime/constants";
import { getMediaType } from "#src/services/mime/getMediaType";
import { getMimeTypeEntryMap } from "#src/services/mime/getMimeTypeEntryMap";

// The default charset of a media type: the dataset's own, else UTF-8 for any text type
export const charset = (type: string): false | string => {
  const mediaType = getMediaType(type);
  const dataCharset = getMimeTypeEntryMap().get(mediaType.toLowerCase())?.charset;
  if (dataCharset) return dataCharset;
  return TEXT_MEDIA_TYPE_REGEX.test(mediaType) ? DEFAULT_TEXT_CHARSET : false;
};
