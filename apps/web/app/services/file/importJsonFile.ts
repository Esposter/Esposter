import { MimeType } from "#shared/models/file/MimeType";
import { importFile } from "@/services/file/importFile";

export const importJsonFile = (onSelect: (file: File) => Promise<void>) => importFile(MimeType.Json, ".json", onSelect);
