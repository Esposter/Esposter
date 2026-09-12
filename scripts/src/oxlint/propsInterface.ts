import type { Plugin } from "@oxlint/plugins";

import { noExportedType } from "#src/services/oxlint/propsInterface/noExportedType";
import { requirePropsName } from "#src/services/oxlint/propsInterface/requirePropsName";
import { definePlugin } from "@oxlint/plugins";
// An oxlint JS plugin enforcing the SFC props-interface convention (vue/SKILL.md).
//
// A props interface declared inside an SFC is file-scoped, so every word beyond `Props` is a word the file path
// Already spells. The name is fixed at `Props` so there is nothing to decide: counting those words is a
// Judgement call no linter can check, and one settled per folder drifts.
//
// A shape another file reads is a different thing: it moves to its own `.ts` beside the component that owns it,
// Named after its single export the way any other module is. So an SFC exports no type at all, and an import
// Site never has to guess whether a name it reads came from a component or a module.
//
// Both rules are purely syntactic and scoped to `**/*.vue` in the root .oxlintrc.json.
const plugin: Plugin = definePlugin({
  meta: { name: "props-interface" },
  rules: { "no-exported-type": noExportedType, "require-props-name": requirePropsName },
});

export default plugin;
