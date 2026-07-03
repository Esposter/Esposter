import { release } from "node:os";
// Fingerprints the host for the persisted cross-process caches (the os-backend capability verdict, the win32 WSL
// Environment probes): platform + kernel release. A cached result self-invalidates when this string changes — a
// Kernel upgrade bumps `release()`. Deliberately spawn-free: computing the key must never itself cost a subprocess, or
// It would defeat the cache it feeds (on win32 the whole point is to avoid a `wsl.exe` round-trip). A change the key
// Can't see (bwrap just installed; a WSL-distro/kernel swap `release()` can't observe since it reports the Windows
// Version) is covered by the VIRRUN_FORCE_PROBE escape / `cache clean`, not this key.
export const getHostFingerprint = (): string => `${process.platform}:${release()}`;
