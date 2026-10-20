# Roadmap

## Later

- [ ] Derive `MJML_BLOCK_TEXT_TAGS` from the component definitions. The list in `constants.ts` restates each component's content kind by hand, so a component that gains or loses a content kind drifts from it silently, and `parseMjmlDocument` is its only reader. The derivation needs a decision on module direction first: the components import `constants.ts` for the padding attributes, so a plain import of the registry from `constants.ts` would form a cycle, and the list moves to a module that reads the registry or the registry takes the list.
- [ ] Pair each component's content kind with its content schema in one place. Each of the component files that declares a content kind writes its own content schema beside it (`z.string()` for a label, the rich text schema for a rich text kind), and the renderer parses content by the kind it reads, so a label-kind component whose content schema is something else passes its own definition until a test catches it. The decision is where the kind-to-schema mapping lives, so a new component with a content kind takes its content schema from that mapping rather than a copy of it.
