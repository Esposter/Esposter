import { createHash } from "node:crypto";

// RFC 4122 version 5: the SHA-1 of a namespace's bytes and a name, with the version and variant bits set. A fixed namespace
// and a fixed name give the same id on every run, so a re-run writes the same rows and a reference recomputes its target
export const getUuidV5 = (namespace: string, name: string): string => {
  const hash = createHash("sha1")
    .update(Buffer.from(namespace.replaceAll("-", ""), "hex"))
    .update(name, "utf8")
    .digest();
  const bytes = Buffer.from(hash.subarray(0, 16));
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x50;
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};
