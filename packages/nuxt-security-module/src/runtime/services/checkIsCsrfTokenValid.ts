import { checkIsEqualInConstantTime } from "#src/runtime/services/checkIsEqualInConstantTime";

// The double submit check: a state-changing request is valid only when its header repeats the cookie exactly.
// A missing cookie or header is never valid, so an empty pair cannot match
export const checkIsCsrfTokenValid = (cookieToken: string | undefined, headerToken: null | string): boolean => {
  if (!cookieToken || !headerToken) return false;

  return checkIsEqualInConstantTime(cookieToken, headerToken);
};
