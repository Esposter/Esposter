import { timingSafeEqual } from "node:crypto";
// Compared in constant time, so how long a wrong guess takes says nothing about how close it was. An empty token
// Matches nothing: two empty buffers compare equal, and a host whose token went missing would otherwise take a
// Connection that presents none
export const checkIsTokenValid = (candidate: string, token: string): boolean => {
  if (!token) return false;

  const candidateBuffer = Buffer.from(candidate);
  const tokenBuffer = Buffer.from(token);
  return candidateBuffer.length === tokenBuffer.length && timingSafeEqual(candidateBuffer, tokenBuffer);
};
