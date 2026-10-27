# Proposal

## Why

A session's prompts carry a pattern the band does not show: how the person is asking for things. Seven scores, one per sin, make that pattern visible, and a pane with one bar per sin shows it at a glance and moves with each prompt. It is optional, and it runs only where a TypeSafe key is set, so it spends the key the person already has and nothing else.

## What Changes

- A sixth mod, `sins`, switched by `/sins [on | off]` and off until switched on. Turning it on without a TypeSafe key is refused with a message, and the switch does not change.
- With sins on and a key set, each prompt the person sends gets one Jev call that places the prompt on ordered levels for all seven sins at once. The prompt is redacted first, and it is never held for the answer.
- Each sin's score is a discounted Beta posterior over those levels. It moves about halfway toward a new pattern within thirty prompts, and its spread narrows as prompts accrue.
- A pane, opened from the band with `p`, draws seven horizontal bars, one per sin in its own fixed colour, each with its spread and its last thirty prompts as a trend. The band keeps one summary line.
- The network call and an evidence log run in a node script the plugin ships, because a mod has no Node. The log is node:sqlite, so the evidence can be replayed under a different half-life later.
- **BREAKING** for the genshin-mods README's Decisions. That README says no mod adds a service or a key, and that a model-calling mod goes through the session's own fork. The sins mod becomes the one exception, so the bullet is rewritten on ship, with its old direction named as rejected.

## Capabilities

### New Capabilities

- `infra/claude-interface/genshin-mods/sins`: the seven scores of a session's prompts, their Jev evidence, their discounted update, and the switch, band line and pane that show them.

### Modified Capabilities

None. The other five mods' requirements do not change.

## Impact

- `packages/genshin-mods`: a new `services/sins/` folder with a node script, `sinsScript.ts`, whose code runs inline through `node -e`; a shared `services/readHome.ts` that ward's records path also uses; a pane, a band line, a prompt hook in the lifecycle, a switch, a button and state keys. The package gains no dependency and no lockfile: the script calls the documented HTTP API with `fetch`.
- No service, database server or Azure resource. The evidence log is one node:sqlite file in the person's Claude config folder, beside the ward mod's records.
- The first Node release where node:sqlite runs without a flag, or a later one.
- The genshin-mods README and the typed-decisions design each gain a sentence on ship (see the design's Notes).
