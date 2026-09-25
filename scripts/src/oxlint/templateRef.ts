import type { Plugin } from "@oxlint/plugins";

import { requireRefName } from "#src/services/oxlint/templateRef/requireRefName";
import { definePlugin } from "@oxlint/plugins";
// An oxlint JS plugin enforcing the vue skill's rule that a template ref is bound under the name its `ref="…"`
// Attribute gives it, with no `Ref` suffix — `const video = useTemplateRef("video")`. The key is the one string
// That ties the script's binding to the template's element, so two spellings of it are a reader matching them by
// Eye, and the suffix restates what the call already says.
//
// It reads one declarator: the binding against the literal key it is initialised with. The only name it knows is
// Vue's own `useTemplateRef` — a library's vocabulary — and a key computed at runtime is left alone, since it
// Names no attribute the file spells. Whether a generic is earned is a judgement about inference, so it stays
// With review.
const plugin: Plugin = definePlugin({
  meta: { name: "template-ref" },
  rules: { "require-ref-name": requireRefName },
});

export default plugin;
