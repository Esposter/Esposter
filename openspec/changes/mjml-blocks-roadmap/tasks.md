# Roadmap

## Later

- [ ] Pair each component's content kind with its content schema in one place. Each content kind now has a shared schema helper (`createMjmlLabelContentSchema` for a label, `createMjmlRawContentSchema` for a raw kind), but nothing ties a component's `content` schema to its kind: a label-kind component that declares `content: z.number()` is still accepted at definition, and the renderer parses content by the kind it reads, so the mismatch surfaces only when a test catches it. The decision is where the kind-to-schema mapping lives, so a new component with a content kind takes its content schema from that mapping rather than a copy of it.
