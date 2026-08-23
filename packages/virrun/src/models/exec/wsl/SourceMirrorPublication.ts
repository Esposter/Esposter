import type { SourceMirrorManifest } from "#src/models/exec/wsl/SourceMirrorManifest";

import { sourceMirrorManifestSchema } from "#src/models/exec/wsl/SourceMirrorManifest";
import { z } from "zod";
// What the mirror published beside `tree/` after its last successful sync (manifest.json): the tree state it holds
// (`entries`) *and* the exclude set that state was walked under (`excludes`). Both halves are load-bearing, because
// The delta can only delete paths the previous manifest listed: when the exclude set grows, the copies the mirror
// Already holds of the newly excluded paths appear in neither side of the diff and would linger forever — visible to
// The sandbox, lintable, and flushable back onto a host that deleted them. Recording the set is what lets the planner
// See that disagreement at all: each path the two sets differ on becomes a targeted `rm -rf`
// (diffSourceMirrorManifests), deliberately not a rebuild, because worktrees come and go constantly
// (wsl-source-mirror.md). Only a bare-name disagreement — the one shape a path list cannot express — falls back to
// The clearing full materialize (createWslSourceMirrorSync).
// A pre-publication manifest.json is a bare entries record, so it fails this schema and takes the same self-heal.
export interface SourceMirrorPublication {
  readonly entries: SourceMirrorManifest;
  readonly excludes: readonly string[];
}

export const sourceMirrorPublicationSchema: z.ZodObject<{
  entries: typeof sourceMirrorManifestSchema;
  excludes: z.ZodArray<z.ZodString>;
}> = z.object({
  entries: sourceMirrorManifestSchema,
  excludes: z.array(z.string()),
}) satisfies z.ZodType<SourceMirrorPublication>;
