// The groups a module's declarations sort into, in perfectionist's default order.
// A declaration sits in its kind's `declare-` group when ambient, and in its `export-` group when exported.
// Otherwise it sits in the bare kind's group.
const GROUP_NAMES: (string | string[])[] = [
  "declare-enum",
  "export-enum",
  "enum",
  ["declare-interface", "declare-type"],
  ["export-interface", "export-type"],
  ["interface", "type"],
  "declare-class",
  "class",
  "export-class",
  "declare-function",
  "export-function",
  "function",
];

export const getGroupIndex = (group: string): number =>
  GROUP_NAMES.findIndex((groupNames) =>
    typeof groupNames === "string" ? groupNames === group : groupNames.includes(group),
  );
