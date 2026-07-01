// The CLI subcommand names, shared by each command's `meta.name` and the parent command's `subCommands` keys
// (mainCommand, cacheCommand) so the dispatch key and its usage label can never drift apart.
export enum CommandType {
  // `virrun cache <ls|clean>` — parent for the cache-management subcommands.
  Cache = "cache",
  // `virrun cache clean [--all]` — remove the repo-local .virrun cache.
  Clean = "clean",
  // `virrun doctor` — diagnose the os backend's prerequisites and report what's missing.
  Doctor = "doctor",
  // `virrun exec -- <cmd>` — forced cold plain exec, no warm-snapshot reuse.
  Exec = "exec",
  // `virrun init [--backend] [--force]` — write a virrun.config.json.
  Init = "init",
  // `virrun cache ls` — list the dep store and warm snapshots.
  Ls = "ls",
  // `virrun run -- <cmd>` — warm-snapshot passthrough, the default subcommand.
  Run = "run",
  // `virrun snapshot` — provision the os backend's warm dependency snapshot.
  Snapshot = "snapshot",
}
