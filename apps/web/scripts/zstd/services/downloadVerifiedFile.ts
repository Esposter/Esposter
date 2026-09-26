import { InvalidOperationError, Operation } from "@esposter/shared";
import { createHash } from "node:crypto";
import { writeFile } from "node:fs/promises";

// A toolchain or a source archive is used only once its bytes match the checksum its publisher states
export const downloadVerifiedFile = async (url: string, sha256: string, path: string): Promise<void> => {
  const response = await fetch(url);
  if (!response.ok) throw new InvalidOperationError(Operation.Read, url, `download failed with ${response.status}`);

  const bytes = new Uint8Array(await response.arrayBuffer());
  const digest = createHash("sha256").update(bytes).digest("hex");
  if (digest !== sha256) throw new InvalidOperationError(Operation.Read, url, `checksum ${digest} is not ${sha256}`);

  await writeFile(path, bytes);
};
