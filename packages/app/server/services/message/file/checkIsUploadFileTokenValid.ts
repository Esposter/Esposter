import { dayjs } from "#shared/services/dayjs";
import { createUploadFileToken } from "@@/server/services/message/file/createUploadFileToken";
import { ID_SEPARATOR } from "@esposter/shared";
import { timingSafeEqual } from "node:crypto";

// Compared without leaking how much of the signature matched — the lengths are compared first because
// TimingSafeEqual throws on a mismatch, and a wrong-length token is already a forgery
export const checkIsUploadFileTokenValid = (userId: string, roomId: string, id: string, token: string): boolean => {
  const expiresAt = Number(token.slice(0, token.indexOf(ID_SEPARATOR)));
  if (!Number.isInteger(expiresAt) || expiresAt <= dayjs().valueOf()) return false;

  const expectedToken = Buffer.from(createUploadFileToken(userId, roomId, id, expiresAt));
  const actualToken = Buffer.from(token);
  return expectedToken.length === actualToken.length && timingSafeEqual(expectedToken, actualToken);
};
