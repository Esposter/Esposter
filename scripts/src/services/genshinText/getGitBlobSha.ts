import { createHash } from "node:crypto";

// The SHA-1 git names a file's content by: the hash of `blob <byte length>`, a NUL byte, then the bytes. The Git Trees API
// Lists every file by it, so a local file is the remote one exactly when the two match, which a size cannot say
export const getGitBlobSha = (content: Uint8Array): string =>
  createHash("sha1").update(`blob ${content.byteLength}\0`).update(content).digest("hex");
