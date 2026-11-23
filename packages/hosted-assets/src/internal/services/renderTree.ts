import type { KeyTree } from "#src/internal/models/KeyTree";

import { renderName } from "#src/internal/services/renderName";

// The order the lint sorts names by, the same as scripts' compareNaturally, which the install cannot import before a build
const NATURAL_COLLATOR = new Intl.Collator("en-US", { numeric: true });

export const renderTree = (tree: KeyTree, indentation: string): string =>
  Object.entries<KeyTree | string>(tree)
    .toSorted(([left], [right]) => NATURAL_COLLATOR.compare(left, right))
    .map(([name, value]) =>
      typeof value === "string"
        ? `${indentation}${renderName(name)}: ${JSON.stringify(value)},`
        : `${indentation}${renderName(name)}: {\n${renderTree(value, `${indentation}  `)}\n${indentation}},`,
    )
    .join("\n");
