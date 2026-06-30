import { BackendType } from "@/models/virrun/BackendType";
import { z } from "zod";
// The repo-root `virrun.config.json` (specs/config-and-cache.md): a checked-in, reviewable selection of which
// Backend a sandboxed command runs through. The `virrun -- <cmd>` prefix is the switch for *whether* a command
// Is sandboxed (add it to adopt, remove it to drop); this config only chooses *how*. An absent file means the
// Default backend (auto → native today), so no config is a valid, fully-functional state.
export interface VirrunConfiguration {
  // BackendType a sandboxed command runs through. When it can't run on this host (e.g. `os` off Linux) the
  // Resolver degrades to native — the worst case of adopting a command is "no speedup", never "broken".
  readonly backend: BackendType;
}
// Validates the committed `virrun.config.json` text into a VirrunConfiguration. strictObject so a typo'd key fails
// Loud rather than silently changing the sandbox; the editor-only `$schema` pointer is the one extra key allowed.
// An omitted `backend` defaults to auto, so `{}` — or no file at all — is valid.
export const virrunConfigurationSchema: z.ZodObject<
  { $schema: z.ZodOptional<z.ZodString>; backend: z.ZodDefault<z.ZodEnum<typeof BackendType>> },
  z.core.$strict
> = z.strictObject({
  $schema: z.string().optional(),
  backend: z.enum(BackendType).default(BackendType.Auto),
}) satisfies z.ZodType<VirrunConfiguration>;
