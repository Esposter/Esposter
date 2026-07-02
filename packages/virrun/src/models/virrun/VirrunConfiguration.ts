import { BackendType } from "@/models/virrun/BackendType";
import { Environment } from "@/models/virrun/Environment";
import { z } from "zod";
// The repo-root `virrun.config.json` (specs/config-and-cache.md): a checked-in, reviewable selection of which
// Backend a sandboxed command runs through and which framework environment it targets. The `virrun -- <cmd>` prefix
// Is the switch for *whether* a command is sandboxed (add it to adopt, remove it to drop); this config only chooses
// *How*. An absent file means the defaults (backend auto → native today, environment none), so no config is a valid,
// Fully-functional state.
export interface VirrunConfiguration {
  // BackendType a sandboxed command runs through. When it can't run on this host (e.g. `os` off Linux) the
  // Resolver degrades to native — the worst case of adopting a command is "no speedup", never "broken". Optional: the
  // Schema defaults it to auto, so `{}` (or an absent file) is valid and a consumer defaults an omitted value.
  readonly backend?: BackendType;
  // Framework whose source-derived artifacts (e.g. Nuxt's `.nuxt`) the sandbox regenerates into a source-keyed
  // Prepare layer, so type-aware tooling reads a platform-correct, fresh copy instead of the host's. `none` disables
  // The layer entirely — every field is preset-driven; there are no overrides. Optional: the schema defaults it to
  // None.
  readonly environment?: Environment;
}
// Validates the committed `virrun.config.json` text into a VirrunConfiguration. strictObject so a typo'd key fails
// Loud rather than silently changing the sandbox; the editor-only `$schema` pointer is the one extra key allowed.
// Omitted fields default (backend auto, environment none), so `{}` — or no file at all — is valid.
export const virrunConfigurationSchema: z.ZodObject<
  {
    $schema: z.ZodOptional<z.ZodString>;
    backend: z.ZodDefault<z.ZodEnum<typeof BackendType>>;
    environment: z.ZodDefault<z.ZodEnum<typeof Environment>>;
  },
  z.core.$strict
> = z.strictObject({
  $schema: z.string().optional(),
  backend: z.enum(BackendType).default(BackendType.Auto),
  environment: z.enum(Environment).default(Environment.None),
}) satisfies z.ZodType<VirrunConfiguration>;
