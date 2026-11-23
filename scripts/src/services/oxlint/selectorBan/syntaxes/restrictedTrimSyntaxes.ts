import type { SelectorBanList } from "#src/models/oxlint/selectorBan/SelectorBanList";

import { VUE_PACKAGES } from "#src/services/oxlint/selectorBan/constants";

// Vue-only, in script and template alike. A component hands raw input to the tRPC boundary, whose Zod schema
// Normalizes it; trimming here as well swallows a space the user is still typing and duplicates a transform the
// Server already owns. Parsing a string is not a component's job either, so it moves to a service, where trimming is
// Allowed.
const message =
  "Never trim in a component — the tRPC input schema normalizes what a component sends, and a string the component parses belongs in a service. See the vue skill.";

export const RESTRICTED_TRIM_SYNTAXES: SelectorBanList = {
  bans: [
    { message, selector: "ImportSpecifier[imported.name='normalizeString']" },
    { message, selector: "CallExpression[callee.property.name=/^trim(End|Start)?$/u]" },
  ],
  files: [`${VUE_PACKAGES}/**/*.vue`],
  isTemplate: true,
};
