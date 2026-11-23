import type { Plugin } from "@oxlint/plugins";

import { noRestrictedSyntax } from "#src/services/oxlint/selectorBan/noRestrictedSyntax";
import { definePlugin } from "@oxlint/plugins";

// An oxlint JS plugin running the AST-selector bans that ESLint's `no-restricted-syntax` carries, since oxlint has no
// Selector-based rule of its own. Each ban is configuration, and the convention it holds is the one its list's header
// Names. With no bans configured it reports nothing, so loading it changes no lint result.
const plugin: Plugin = definePlugin({
  meta: { name: "selector-ban" },
  rules: { "no-restricted-syntax": noRestrictedSyntax },
});

export default plugin;
