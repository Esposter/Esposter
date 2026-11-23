import type { SelectorBanList } from "#src/models/oxlint/selectorBan/SelectorBanList";

import { SCRIPT_FILES } from "#src/services/oxlint/selectorBan/constants";

// An optimistic entry is a pure change over the keyed view of held state: it reads and writes rows by key, and nothing
// Else. The view cannot enumerate its rows, so an entry never walks it, and a change over held state never assigns a
// Ref. An entry is found by its shape rather than its file: the function an `entry` option holds, or the arrow a
// Factory Returns straight, annotated `: Entry` or not. Its view is its first parameter, which every entry names
// `view`.
const ENTRY_FUNCTION =
  ":matches(Property[key.name='entry'] > :matches(ArrowFunctionExpression, FunctionExpression), ArrowFunctionExpression > :matches(ArrowFunctionExpression, FunctionExpression))[params.0.name='view']";
// The statics and methods that walk a collection. `view.get` and `view.set` name one row, so neither is listed
const VIEW_STATIC_REGEX = "/^(assign|entries|from|fromEntries|getOwnPropertyNames|getOwnPropertySymbols|keys|values)$/";
const VIEW_METHOD_REGEX =
  "/^(entries|every|filter|find|findIndex|flat|flatMap|forEach|keys|map|reduce|reduceRight|some|values)$/";
const ITERATION_SELECTORS = [
  "ForOfStatement[right.name='view']",
  "ForInStatement[right.name='view']",
  "SpreadElement[argument.name='view']",
  "VariableDeclarator[init.name='view'][id.type='ArrayPattern']",
  `CallExpression[callee.object.name=/^(Object|Array)$/][callee.property.name=${VIEW_STATIC_REGEX}] > Identifier[name='view']`,
  `CallExpression[callee.object.name='view'][callee.property.name=${VIEW_METHOD_REGEX}]`,
];
const REF_SELECTORS = [
  "AssignmentExpression[left.type='MemberExpression'][left.computed=false][left.property.name='value']",
  "UpdateExpression[argument.type='MemberExpression'][argument.computed=false][argument.property.name='value']",
];
const ITERATION_MESSAGE =
  "An optimistic entry reads and writes rows by key, so it never iterates its view: name each row through `view.get` or `view.set`. See openspec/specs/architecture/client-data/design.md (useMutation).";
const REF_MESSAGE =
  "An optimistic entry is a pure change over the keyed view, so it never assigns a ref: write the row with `view.set`, and the screen reads the view. See openspec/specs/architecture/client-data/design.md (useMutation).";

export const RESTRICTED_OVERLAY_SYNTAXES: SelectorBanList = {
  bans: [
    ...ITERATION_SELECTORS.map((selector) => ({
      message: ITERATION_MESSAGE,
      selector: `${ENTRY_FUNCTION} ${selector}`,
    })),
    ...REF_SELECTORS.map((selector) => ({ message: REF_MESSAGE, selector: `${ENTRY_FUNCTION} ${selector}` })),
  ],
  files: SCRIPT_FILES,
};
