import { release } from "node:os";
// Fingerprints the host for the persisted capability cache: platform + kernel release. os-backend support hinges on
// The kernel (unprivileged user namespaces + overlayfs), so a kernel upgrade — which bumps `release()` — invalidates
// The cached verdict. Deliberately spawn-free: computing the key must never itself cost a subprocess, or it would
// Defeat the cache it feeds (on win32 the whole point is to avoid a `wsl.exe` round-trip). A capability change with
// No release bump (e.g. bwrap just installed, or on win32 a WSL-kernel swap `release()` can't see since it reports
// The Windows version) is covered by the VIRRUN_FORCE_PROBE escape / `cache clean`, not this key.
export const getCapabilityCacheKey = (): string => `${process.platform}:${release()}`;
