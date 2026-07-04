import { SAVE_FILENAME } from "@@/server/services/blobState/constants";

export const getSaveBlobName = (userId: string): string => `${userId}/${SAVE_FILENAME}`;
