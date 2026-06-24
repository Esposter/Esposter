# Delegate the CLI to unjs/citty

Replace the hand-rolled `argv` parsing in `src/cli.ts` with [unjs/citty](https://github.com/unjs/citty) for declarative commands, flags, and help.

## Why deferred

The MVP CLI is a single `sandbox -- <command>` passthrough — one separator split, no flags. A full arg-parsing framework is more surface than that needs, and citty is a runtime dependency we should not carry until it earns its place.

## Revisit when

The CLI grows real options — subcommands (`sandbox run` / `sandbox snapshot`), backend/source flags, `--help` output — i.e. once Phase 4 (Distribution & CI) starts adding the higher adoption levels. At that point hand-rolled parsing stops being modular and citty's command/flag model pays for itself.
