import { join } from "node:path";
// The tar virrun spawns. On win32 that is Windows' own bundled bsdtar, resolved by absolute path rather than left to
// PATH: a host with Git/MSYS ahead of System32 resolves `tar` to GNU tar, which reads the drive letter in `-f
// C:\...\archive` as an rsh host and dies with `Cannot connect to C: resolve failed`. The source-mirror archive is
// Written to a Windows path by definition, and the unarchived-path attribution reads bsdtar's behaviour besides, so
// The binary is named, not guessed. Everywhere else the platform's own `tar` is the only one on offer.
export const getTarExecutable = (): string =>
  process.platform === "win32" ? join(process.env.SystemRoot ?? String.raw`C:\Windows`, "System32", "tar.exe") : "tar";
