# Roadmap

Open work, each item linking the spec or design it concerns. Rationale lives in [block types](../../specs/mjml-blocks/block-types/design.md).

## Next

- [x] [Speed check for long unclosed-tag runs](../../specs/mjml-blocks/block-types/design.md) — the read of a label holding a long run of unclosed tags was checked for linear time by a timing assertion in `readMjmlContent.test.ts`, which was removed because a timing assertion in the unit suite flakes on a loaded host. The package now has its committed bench: `packages/mjml-blocks/src/services/readMjmlContent.bench.ts` times the label read over 1,000, 10,000 and 100,000 unclosed `<a` openings, each beside the same run ending in a real tag, with its `readMjmlContent.bench.md` and `.json` committed beside it and `@esposter/shared-node` wired as the package's devDependency
