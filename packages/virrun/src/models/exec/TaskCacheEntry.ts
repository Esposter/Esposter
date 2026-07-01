import type { FlushOp } from "@/models/exec/FlushOp";

import { FlushOpType } from "@/models/exec/FlushOp";
import { z } from "zod";
// The recorded outcome of one exit-0 persist run, replayed verbatim on a later cache hit so the sandbox is skipped
// (specs/config-and-cache.md). `plan` is the write-back FlushOp[] (buildHostFlushPlan) that reconciles the entry's
// `upper` payload onto the host; `exitCode`/`stdout`/`stderr` reproduce the command's observable output. Persisted
// As meta.json and zod-validated on read (parseTaskCacheEntry) since it is untrusted on-disk state.
export interface TaskCacheEntry {
  readonly exitCode: number;
  readonly plan: readonly FlushOp[];
  readonly stderr: string;
  readonly stdout: string;
}

export const taskCacheEntrySchema: z.ZodObject<{
  exitCode: z.ZodNumber;
  plan: z.ZodArray<z.ZodObject<{ relativePath: z.ZodString; type: z.ZodEnum<typeof FlushOpType> }>>;
  stderr: z.ZodString;
  stdout: z.ZodString;
}> = z.object({
  exitCode: z.number(),
  plan: z.array(
    z.object({
      // The entry is persisted, hand-editable meta.json replayed onto the host via applyFlushPlan, so reject any
      // Path that would escape hostDir (absolute, or a `..` segment) before it reaches the host-write script.
      relativePath: z
        .string()
        .refine(
          (relativePath) => !relativePath.startsWith("/") && !relativePath.split("/").includes(".."),
          "relativePath must stay within the host directory",
        ),
      type: z.enum(FlushOpType),
    }),
  ),
  stderr: z.string(),
  stdout: z.string(),
}) satisfies z.ZodType<TaskCacheEntry>;
