import { ID_SEPARATOR } from "@esposter/shared";

export const getBlobName = (filepath: string, filename: string) => `${filepath}${ID_SEPARATOR}${filename}`;
