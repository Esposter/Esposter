import { MimeType } from "#shared/models/file/MimeType";
import { JSON_FILE_ACCEPT } from "#src/services/file/constants";
import { importFile } from "#src/services/file/importFile";

export const importJsonFile = (onSelect: (file: File) => Promise<void>) =>
  importFile(MimeType.Json, JSON_FILE_ACCEPT, onSelect);
