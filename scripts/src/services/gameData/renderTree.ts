import type { KeyTree } from "#src/models/gameData/KeyTree";

import { renderName } from "#src/services/gameData/renderName";
import { compareNaturally } from "#src/services/shared/compareNaturally";

export const renderTree = (tree: KeyTree, indentation: string): string =>
  Object.entries<KeyTree | string>(tree)
    .toSorted(([left], [right]) => compareNaturally(left, right))
    .map(([name, value]) =>
      typeof value === "string"
        ? `${indentation}${renderName(name)}: ${JSON.stringify(value)},`
        : `${indentation}${renderName(name)}: {\n${renderTree(value, `${indentation}  `)}\n${indentation}},`,
    )
    .join("\n");
