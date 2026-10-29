# Roadmap

Open work, each item linking the spec or design it concerns. Rationale lives in [block types](../../specs/mjml-blocks/block-types/design.md).

## Open

- [ ] [Speed check for long unclosed-tag runs](../../specs/mjml-blocks/block-types/design.md) — the read of a label holding a long run of unclosed tags was checked for linear time by a timing assertion in `readMjmlContent.test.ts`, which was removed because a timing assertion in the unit suite flakes on a loaded host. The speed claim now has no measurement: no `*.bench.ts` exists in `packages/mjml-blocks`, so a quadratic regression in `readMjmlContent` on `"<a".repeat(30_000)` passes every test. Decide how the package gets a committed bench (its first `*.bench.ts`, its `*.bench.md` and `*.bench.json`, and the `@esposter/shared-node` bench wiring it needs), then add one benching that input in the same change, following the `bench` skill's speed gate
