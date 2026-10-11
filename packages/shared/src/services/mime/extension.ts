import { getMediaType } from "#src/services/mime/getMediaType";
import { getMimeTypeEntryMap } from "#src/services/mime/getMimeTypeEntryMap";

// The extension a media type is conventionally saved under, which is the first one the dataset lists for it
export const extension = (type: string): false | string =>
  getMimeTypeEntryMap().get(getMediaType(type).toLowerCase())?.extensions?.[0] ?? false;
