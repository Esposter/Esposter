import { ID_SEPARATOR } from "@esposter/shared";

export const getBookmarkRowKey = (roomId: string, messageRowKey: string) => `${roomId}${ID_SEPARATOR}${messageRowKey}`;
