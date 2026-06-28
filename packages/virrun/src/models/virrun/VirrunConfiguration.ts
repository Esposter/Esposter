import type { BackendType } from "@/models/virrun/BackendType";
// The repo-root `virrun.config.json` (specs/config-and-cache.md): a checked-in, reviewable allowlist of which
// Commands run through the sandbox and which backend they use. Removing an entry un-adopts a command repo-wide
// In one edit; an absent file means nothing routes. This is adoption level 3 — routing moves off the command
// Line into version control while staying per-command and fully reversible.
export interface VirrunConfiguration {
  // BackendType a routed command runs through (auto | native | vfs | os). `auto` resolves to native today.
  readonly backend: BackendType;
  // BackendType to defer to when `backend` can't run on this host (e.g. `os` off Linux). Never errors the
  // Build — the worst case of adopting a command is "no speedup", never "broken".
  readonly fallback: BackendType;
  // Commands that route through the sandbox, matched by leading tokens (`pnpm install` matches
  // `pnpm install --frozen-lockfile`). Everything not listed stays native — per-command granularity.
  readonly route: readonly string[];
}
