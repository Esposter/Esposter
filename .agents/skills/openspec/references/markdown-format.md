# Markdown Format

Read when writing a page's markdown — its file format, a callout, or a fenced code block.

- **Plain GFM in a `.md` file, never `.mdx`**, since GitHub renders it and `.md` stays readable in an editor and in grep. No block component syntax (`::note`): nothing renders it, so it shows as literal colons. A callout is a bold lead-in on its own paragraph.
- **No frontmatter.** A page's title is its `#` heading, and a change's metadata is its `.openspec.yaml` (`references/change-metadata.md`). A `spec.md` follows the CLI's own shape: `# <capability> Specification`, `## Purpose`, `## Requirements`.
- **A fenced block names its language by the short alias** — `ts`, never `typescript` — so one fence language means one spelling, and a block with no language to highlight says `text`.
- **A generated page sits in a `generated/` folder beside the capability that reads it**, written by its generator and never by hand (`openspec/specs/architecture/generated-artifacts/design.md`): the flow map, `openspec/specs/architecture/ui-library/generated/flow-map.md`, is one.
