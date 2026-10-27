# Running REA

Read when running REA: its pinned install, the command shape, `doctor`, and which commands read a target at rest.

## Install

REA is the `rea-agents` package on npm: MIT licensed, published by its maintainer `morluto`, whose repository is `github.com/morluto/rea`. The install lives in the machine cache, which is `CACHE_ROOT` in `packages/shared-node`, at `rea-agents/6.8.0` beneath it.

To install or re-pin it, make that folder, run `npm init -y` in it, then run `npm install rea-agents@6.8.0 --ignore-scripts --no-audit --no-fund`. The `--ignore-scripts` flag skips the native build of the terminal binding, which only the terminal capture needs. The static commands below ran with it skipped.

## Running it

Run the bin directly with Node, since the `.bin` shim adds nothing: `node <cache>/node_modules/rea-agents/scripts/rea.mjs <command> <path> [options]`. Add `--format json` for machine-readable output, `--help` for a command's options, and `--schema` for its JSON schema.

Large results can be saved with `--detail summary --evidence_output <path>`, which writes the complete evidence as a bundle and never overwrites an existing one.

## Doctor

`rea doctor --format json` checks readiness. On this machine it reports `healthy: false`, which is the expected state, not a fault to repair: Node 26 passes, the analysis engines are unset (Hopper, Ghidra, IDA, JADX and Kuna each need a caller-supplied path), and the skill identity shows drift because `setup` never ran.

## Which commands read a target at rest

REA's README sorts its analyses by the engine each needs (`github.com/morluto/rea`, "What you can analyze"). The ones this repo's work reaches need none:

- `inspect-il2cpp-metadata`, for a Unity metadata file (`references/unity-il2cpp.md`);
- `compare-managed-members`, for the declared members of managed PE assemblies;
- `analyze-javascript-application`, for an Electron or JavaScript app's directory or ASAR.

Native decompilation (`decompile`, `decompile-all`, `function`) needs Hopper, Ghidra or IDA, and none is installed.
