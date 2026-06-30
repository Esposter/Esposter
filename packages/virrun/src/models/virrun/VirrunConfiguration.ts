import { BackendType } from "@/models/virrun/BackendType";
import { z } from "zod";
// The repo-root `virrun.config.json` (specs/config-and-cache.md): a checked-in, reviewable selection of which
// Backend a sandboxed command runs through. The `virrun -- <cmd>` prefix is the switch for *whether* a command
// Is sandboxed (add it to adopt, remove it to drop); this config only chooses *how*. An absent file means the
// Default backend (auto → native today), so no config is a valid, fully-functional state.
export interface VirrunConfiguration {
  // BackendType a sandboxed command runs through (auto | native | vfs | os). `auto` resolves to native today.
  // When `backend` can't run on this host (e.g. `os` off Linux) the resolver degrades to native, so the worst
  // Case of adopting a command is "no speedup", never "broken" — the degrade target is always native, not a knob.
  readonly backend: BackendType;
}
// Validates the raw `virrun.config.json` text (untrusted committed input) into a VirrunConfiguration, like
// ParseOverlayManifest validates the probe's JSON. strictObject so a typo'd key fails loud rather than silently
// Changing the sandbox; the editor-only `$schema` pointer is the one extra key allowed (stripped from the result by
// The parser). An omitted `backend` takes the safe default (auto), so a minimal `{}` — or no file at all — is valid.
export const virrunConfigurationSchema: z.ZodObject<
  { $schema: z.ZodOptional<z.ZodString>; backend: z.ZodDefault<z.ZodEnum<typeof BackendType>> },
  z.core.$strict
> = z.strictObject({
  $schema: z.string().optional(),
  backend: z.enum(BackendType).default(BackendType.Auto),
}) satisfies z.ZodType<VirrunConfiguration>;
