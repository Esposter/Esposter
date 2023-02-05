import hrtime from "browser-hrtime";

// Get current epoch time in nanoseconds
export const now = () => {
  const [ms, ns] = isServer() ? process.hrtime() : hrtime();
  return (BigInt(ms) * BigInt(1e9) + BigInt(ns)).toString();
};
