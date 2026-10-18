# Change Metadata

Read when writing a change's `.openspec.yaml`, or a deferred or rejected idea's.

`openspec new change` writes `schema` and `created`. The rest is ours: OpenSpec's own `affected_areas`, and keys of our own with an `x-` prefix, which the CLI leaves to the tools that read them. A page carries no frontmatter, and no status or date fields anywhere — location carries status, git carries history.

```yaml
schema: spec-driven
created: <YYYY-MM-DD>
affected_areas: [<area>]
x-model: <model id>
```

- `affected_areas` names the areas the change moves, the first being its id's prefix.
- `x-model` is the model that wrote the design, or last rewrote its substance (`x-model: claude-opus-5-5`), because a design is executed cold later and the reader weighs it by who designed it; git names the committer, not the model behind it. Every open change with a design names one, held by `scripts/src/workspace/changeModel.test.ts`.
- `skip_specs: true` marks a change with no spec delta: a roadmap, a refactor, a pure tooling change, and every deferred or rejected idea.

A change may also name the fleet's three fields, each optional and read by `pnpm ai:fleet:next --kind unit` (the `throughput` skill, `references/fleet.md`):

- `x-needs: [game-exports, game-install, media-engine, ...]` — the capabilities a machine must hold to take the change; name one only when a part reads the installed game or its exports;
- `x-touches: ["<glob>", ...]` — the folders a part edits that its Key files table does not already name, quoted so a `*` is not read as a YAML alias;
- `x-waiting: "<blocker>"` — set only while the change is blocked wholly on another change or on missing data, and removed when the blocker clears. A change with `x-waiting` is not offered to any machine.

Omitted, each reads as empty, so a change with none of them is ready to take on any machine that lends its area. A sequence is written in flow style (`[a, b]`); a bare string where a sequence belongs fails the fleet's read rather than reading as empty.
