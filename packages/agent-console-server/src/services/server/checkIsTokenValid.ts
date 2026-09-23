import { timingSafeEqual } from "node:crypto";
// Compared in constant time, so how long a wrong guess takes says nothing about how close it was
export const checkIsTokenValid = (candidate: string, token: string): boolean => {
  const candidateBuffer = Buffer.from(candidate);
  const tokenBuffer = Buffer.from(token);
  return candidateBuffer.length === tokenBuffer.length && timingSafeEqual(candidateBuffer, tokenBuffer);
};
