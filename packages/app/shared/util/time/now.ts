import { hrtime } from "#shared/util/time/hrtime";

const loadNanoseconds = hrtime();
const loadMilliseconds = new Date().getTime();
// Get current epoch time in nanoseconds
export const now = () => {
  const [seconds, nanoseconds] = hrtime(loadNanoseconds);
  return (BigInt(loadMilliseconds) * BigInt(1e6) + (BigInt(seconds) * BigInt(1e9) + BigInt(nanoseconds))).toString();
};
