Materialize the sandbox `node_modules` onto the host disk (e.g. for IDE/intellisense), beyond the produced-artifact write-back.

## Why deferred

Write-back ([specs/write-back.md](../specs/write-back.md)) flushes only a command's produced files; `node_modules` lives in the read-only snapshot lower and is structurally excluded, preserving "node_modules never touches disk". Forcing the full dep tree onto host disk reintroduces exactly the I/O cost virrun exists to remove, and most consumers don't need it — the editor can point at the snapshot store, or run a one-off native `pnpm install`.

## Revisit when

A concrete editor/tooling flow proves it needs an on-disk `node_modules` that the snapshot store can't satisfy, and the copy-out cost is measured acceptable against the speed gate.

## Cheaper interim

Run a plain native `pnpm install` (or `virrun -- pnpm install` then point the IDE at the store) when on-disk deps are genuinely required.
