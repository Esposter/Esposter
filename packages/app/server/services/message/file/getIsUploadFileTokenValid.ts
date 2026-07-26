import { createUploadFileToken } from "@@/server/services/message/file/createUploadFileToken";
import { timingSafeEqual } from "node:crypto";

// Compared without leaking how much of the signature matched — the lengths are compared first because
// TimingSafeEqual throws on a mismatch, and a wrong-length token is already a forgery
export const getIsUploadFileTokenValid = (userId: string, roomId: string, id: string, token: string): boolean => {
  const expectedToken = Buffer.from(createUploadFileToken(userId, roomId, id));
  const actualToken = Buffer.from(token);
  return expectedToken.length === actualToken.length && timingSafeEqual(expectedToken, actualToken);
};
