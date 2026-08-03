import type { SourceMirrorManifest } from "@/models/exec/wsl/SourceMirrorManifest";

import { sourceMirrorManifestSchema } from "@/models/exec/wsl/SourceMirrorManifest";
import { VIRRUN_SOURCE_MIRROR_MANIFEST_FILENAME } from "@/services/exec/wsl/constants";
import { getWslSourceMirrorEntryUnc } from "@/services/exec/wsl/getWslSourceMirrorEntryUnc";
import { getResult } from "@esposter/shared";
import { readFileSync } from "node:fs";
import { join } from "node:path";
// Read the mirror entry's published manifest back over the UNC (one small-file round-trip). It crossed a process
// Boundary as JSON, so it is zod-validated before the diff trusts it; a missing, half-formed, or schema-drifted file
// Returns undefined and the caller falls back to the full materialize — never a delta computed from garbage.
export const readSourceMirrorManifest = (cwd: string): SourceMirrorManifest | undefined => {
  const manifestPath = join(getWslSourceMirrorEntryUnc(cwd), VIRRUN_SOURCE_MIRROR_MANIFEST_FILENAME);
  return getResult(() => readFileSync(manifestPath, "utf8")).match(
    (data) => {
      // eslint-disable-next-line no-restricted-syntax -- the manifest is paths and mtimes-as-numbers
      const parsed = getResult(() => JSON.parse(data) as unknown).unwrapOr(undefined);
      const result = sourceMirrorManifestSchema.safeParse(parsed);
      return result.success ? result.data : undefined;
    },
    () => undefined,
  );
};
