import { createHmac } from "node:crypto";

export const signTableSharedKeyLite = (
  accountName: string,
  accountKey: string,
  xMsDate: string,
  canonicalizedResource: string,
): string => {
  const stringToSign = `${xMsDate}\n/${accountName}/${canonicalizedResource}`;
  const hmac = createHmac("sha256", Buffer.from(accountKey, "base64")).update(stringToSign, "utf8").digest("base64");
  return `SharedKeyLite ${accountName}:${hmac}`;
};
