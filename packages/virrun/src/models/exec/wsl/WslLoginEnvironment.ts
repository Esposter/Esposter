import { z } from "zod";
// What a win32 host's WSL interactive login shell resolves for a sandboxed run: the `path` the sandbox inherits (so a
// Profile-bound node manager's toolchain is on PATH), the `nodeDirectory` that PATH's `node` is installed in, and the
// `nodeVersion` it reports. The version is captured in the same shell as the PATH — deriving it later would re-spawn
// The login shell, and inferring it from the node manager's directory layout would hardcode one manager's convention.
// All three are "" when the capture failed, which the caller degrades on (no PATH injection, host node version) rather
// Than treating as fatal.
//
// `nodeDirectory` is stored rather than re-derived from `path` because it is what makes a persisted capture
// *Checkable*: the cache key is the host fingerprint, which cannot see a node manager switching version, so the only
// Thing standing between a capture taken before an upgrade and a sandbox pinned to a node that no longer exists is a
// Later process asking whether this directory is still there (checkHasSandboxNode). Deriving it at that point would
// Put the capture script's "lead PATH with the dereferenced install directory" convention in a second file, where a
// Change to one side would silently start checking whichever entry happened to be first.
export interface WslLoginEnvironment {
  readonly nodeDirectory: string;
  readonly nodeVersion: string;
  readonly path: string;
}

export const wslLoginEnvironmentSchema: z.ZodObject<{
  nodeDirectory: z.ZodString;
  nodeVersion: z.ZodString;
  path: z.ZodString;
}> = z.object({
  nodeDirectory: z.string(),
  nodeVersion: z.string(),
  path: z.string(),
}) satisfies z.ZodType<WslLoginEnvironment>;
