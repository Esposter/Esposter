# Template Refs

Read when a component takes a ref to an element or a child component, a Tres element included.

- **Template refs always use `useTemplateRef`** — no generic (Vue 3.5+ infers from the template), and the binding is the `ref="..."` value with no `Ref` suffix (`const video = useTemplateRef("video")`, `template-ref/require-ref-name`). Drop any component type imported only for the generic. A generic is justified only where inference falls short: the element doesn't expose the property you want, or the inferred union is too complex to work with. **A ref to a Tres element is `useTresTemplateRef`** (lint-enforced wherever the SFC imports `three` or `@tresjs/*`): `useTemplateRef` reads back through a deep readonly proxy in development, so a Three object reached through it cannot be moved.
