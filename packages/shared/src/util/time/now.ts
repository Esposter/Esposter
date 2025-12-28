import { hrtime } from "@/util/time/hrtime";

const loadNanoseconds = hrtime();
const loadMilliseconds = Date.now();
// Get current epoch time in nanoseconds
export const now = (): string => {
  const [seconds, nanoseconds] = hrtime(loadNanoseconds);
  return (BigInt(loadMilliseconds) * 10n ** 6n + (BigInt(seconds) * 10n ** 9n + BigInt(nanoseconds))).toString();
};
