import { z } from "zod";
// What a win32 host's WSL interactive login shell resolves for a sandboxed run: the `path` the sandbox inherits (so a
// Profile-bound node manager's toolchain is on PATH) and the `nodeVersion` that PATH's `node` reports. The version is
// Captured in the same shell as the PATH — deriving it later would re-spawn the login shell, and inferring it from the
// Node manager's directory layout would hardcode one manager's convention. Both are "" when the capture failed, which
// The caller degrades on (no PATH injection, host node version) rather than treating as fatal.
export interface WslLoginEnvironment {
  readonly nodeVersion: string;
  readonly path: string;
}

export const wslLoginEnvironmentSchema: z.ZodObject<{ nodeVersion: z.ZodString; path: z.ZodString }> = z.object({
  nodeVersion: z.string(),
  path: z.string(),
}) satisfies z.ZodType<WslLoginEnvironment>;
