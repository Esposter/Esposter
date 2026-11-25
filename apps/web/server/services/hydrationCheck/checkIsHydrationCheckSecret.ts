import { timingSafeEqual } from "node:crypto";

// The bearer the check sends, compared without leaking how much of it matched. The lengths are compared first because
// `timingSafeEqual` throws on a mismatch, and a wrong-length bearer is already wrong
export const checkIsHydrationCheckSecret = (authorization: string): boolean => {
  const expected = Buffer.from(`Bearer ${process.env.HYDRATION_CHECK_SECRET}`);
  const actual = Buffer.from(authorization);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
};
