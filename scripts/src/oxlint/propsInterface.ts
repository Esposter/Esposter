import type { Plugin } from "@oxlint/plugins";

import { noExportedType } from "#src/services/oxlint/propsInterface/noExportedType";
import { noUnreadDestructure } from "#src/services/oxlint/propsInterface/noUnreadDestructure";
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
// The three rules are scoped to `**/*.vue` in the root oxlint.config.ts. `no-unread-destructure` reads the scope
// Manager's references, which is syntax and needs no type information, so it stays a plugin rule.
const plugin: Plugin = definePlugin({
  meta: { name: "props-interface" },
  rules: {
    "no-exported-type": noExportedType,
    "no-unread-destructure": noUnreadDestructure,
    "require-props-name": requirePropsName,
  },
});

export default plugin;
