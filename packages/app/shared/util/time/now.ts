const loadNs = process.hrtime();
const loadMs = new Date().getTime();

// Get current epoch time in nanoseconds
export const now = () => {
  const [s, ns] = process.hrtime(loadNs);
  return (BigInt(loadMs) * BigInt(1e6) + (BigInt(s) * BigInt(1e9) + BigInt(ns))).toString();
};
