import type { WardRecord } from "../../../types";

import { getCollidingRecord } from "./getCollidingRecord";

// Windows paths compare as one spelling: forward slashes, lowercase, since the file system ignores case
const getComparablePath = (path: string) => path.replaceAll("\\", "/").toLowerCase();

// The edited path of another session's record inside this checkout, undefined when no other session in the window
// Shares it, so a checkout alone with its session is never refused
export const getCheckoutPeer = (
  records: Record<string, WardRecord>,
  checkoutRoot: string,
  sessionId: string,
  now: number,
): string | undefined => {
  const root = `${getComparablePath(checkoutRoot)}/`;
  return Object.entries(records).find(
    ([path, record]) =>
      getComparablePath(path).startsWith(root) && getCollidingRecord(record, sessionId, now) !== undefined,
  )?.[0];
};
