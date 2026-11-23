// @TODO: https://github.com/ubugeeei-prod/vize/issues/13537 — drop this list once vize's rule takes `ignores`
import type { SelectorBan } from "#scripts/models/oxlint/selectorBan/SelectorBan";

import { foreignTagNames } from "#vite/services/foreignTagNames";
import { htmlTagNames } from "#vite/services/htmlTagNames";

// The PascalCase check of `vue/component-name-in-template-casing`, with the exceptions its options name. The rule reads a
// Tag only up to its first dot, so `Select.Root` is PascalCase and `my-thing.Root` is not. A tag is a component when it is
// No HTML, SVG or MathML tag name, no Vue built-in (`component`), no `primitive` (TresJS) and no `v-*` (the Vuetify ban
// Reports that one). A tag fails PascalCase when it starts with a lowercase letter, or has a dash, an underscore or a
// Colon before its first dot. vize's regex has no lookahead, so those two are written as alternatives. The name decides,
// Not the root it sits under, since a child component can hold an svg element whose `<svg>` is in its parent
const NOT_PASCAL_CASE_REGEX = "/^(?:[^A-Z]|[^.]*[-_:])/";
const KNOWN_TAG_NAME_REGEX = `/^(?:${[...htmlTagNames, ...foreignTagNames].join("|")})$/`;
const MESSAGE =
  "Write a component's tag in PascalCase, as the component is named: `<MyThing />`, not `<my-thing />` or `<mything />`.";

export const COMPONENT_CASING_SYNTAXES: SelectorBan[] = [
  {
    message: MESSAGE,
    selector: `VElement[rawName=${NOT_PASCAL_CASE_REGEX}]:not([rawName=/^v-/], [rawName='primitive'], [rawName='component'], [rawName=${KNOWN_TAG_NAME_REGEX}])`,
  },
];
