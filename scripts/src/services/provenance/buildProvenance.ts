import type { Provenance } from "#src/models/provenance/Provenance";
import type { ProvenanceOptions } from "#src/models/provenance/ProvenanceOptions";

import { readGameVersion } from "#src/services/genshinAssets/shared/readGameVersion";
import { getFileSha256 } from "#src/services/provenance/getFileSha256";
import { runGit } from "#src/services/shared/runGit";
import { platform, release, version } from "node:os";

// The stamp a command's output is written with, read now: the install's game version, the operating system, the commit
// HEAD names with whether the producer's paths hold changes no commit describes, and the SHA-256 of each tool's binary
export const buildProvenance = async ({
  command,
  producerPaths,
  sources = [],
  tools = [],
}: ProvenanceOptions): Promise<Provenance> => {
  const status = runGit(["status", "--porcelain", "--", ...producerPaths]).trim();
  return {
    command,
    gameVersion: await readGameVersion(),
    operatingSystem: { platform: platform(), release: release(), version: version() },
    producer: { commit: runGit(["rev-parse", "HEAD"]).trim(), isDirty: Boolean(status), producerPaths },
    sources,
    tools: await Promise.all(tools.map(async ({ name, path }) => ({ name, sha256: await getFileSha256(path) }))),
  };
};
