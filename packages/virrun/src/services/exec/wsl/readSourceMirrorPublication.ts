import type { SourceMirrorPublication } from "@/models/exec/wsl/SourceMirrorPublication";

import { sourceMirrorPublicationSchema } from "@/models/exec/wsl/SourceMirrorPublication";
import { VIRRUN_SOURCE_MIRROR_MANIFEST_FILENAME } from "@/services/exec/wsl/constants";
import { getWslSourceMirrorEntryUnc } from "@/services/exec/wsl/getWslSourceMirrorEntryUnc";
import { getResult, jsonDateParse } from "@esposter/shared";
import { readFileSync } from "node:fs";
import { join } from "node:path";
// Read the mirror entry's published manifest back over the UNC (one small-file round-trip). It crossed a process
// Boundary as JSON, so it is zod-validated before the diff trusts it; a missing, half-formed, or schema-drifted file
// Returns undefined and the caller falls back to the full materialize — never a delta computed from garbage. A
// Manifest written before the publication shape (bare entries record, no recorded exclude set) drifts by exactly
// That rule, so an existing mirror rebuilds once and drops whatever a since-added exclude left behind in it.
export const readSourceMirrorPublication = (cwd: string): SourceMirrorPublication | undefined => {
  const manifestPath = join(getWslSourceMirrorEntryUnc(cwd), VIRRUN_SOURCE_MIRROR_MANIFEST_FILENAME);
  return getResult(() => readFileSync(manifestPath, "utf8")).match(
    (data) => {
      const parsed = getResult(() => jsonDateParse<unknown>(data)).unwrapOr(undefined);
      const result = sourceMirrorPublicationSchema.safeParse(parsed);
      return result.success ? result.data : undefined;
    },
    () => undefined,
  );
};
