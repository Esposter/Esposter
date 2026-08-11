import { describe } from "vitest";

// The module double for `getSandboxNodeVersion`, for the unit suites that reach it through a cache key rather than
// Asking for it. On win32 the real one shells out to a WSL login shell, which is a multi-second external probe those
// Suites pay for nothing: what they assert is where a layer is addressed, and the guest's node major is an opaque
// Input to that. It is also why they time out in the full parallel run while passing alone — the probe contends with
// Every other project for the same WSL service.
//
// Registered per file (`vi.mock` is hoisted only within the file that writes it), so the acceptance suites that do
// Run sandboxed commands keep the real probe and stay honest about the node they ran under.
//
// It answers `process.version`, which is the real function's own non-win32 branch verbatim — so the double is "the
// Sandbox runs the node this process runs" rather than a literal that silently ages past `engines.node`.
export const getSandboxNodeVersion = (): string => process.version;

describe.todo("getSandboxNodeVersion");
