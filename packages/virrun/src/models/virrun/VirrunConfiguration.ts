import type { BackendType } from "@/models/virrun/BackendType";
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
