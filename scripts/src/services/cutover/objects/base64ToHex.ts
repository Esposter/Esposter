// The hex form of a base64 digest, the form R2 reports an ETag in
export const base64ToHex = (base64: string): string => Buffer.from(base64, "base64").toString("hex");
