import type { KeyTree } from "#src/internal/models/KeyTree";

import { renderName } from "#src/internal/services/renderName";
import { RENDERED_LINE_WIDTH } from "#src/services/renderedLineWidth";

// The order the lint sorts names by, the same as scripts' compareNaturally.
// The install cannot import that before a build.
const NATURAL_COLLATOR = new Intl.Collator("en-US", { numeric: true });

export const renderTree = (tree: KeyTree, indentation: string): string =>
  Object.entries<KeyTree | string>(tree)
    .toSorted(([left], [right]) => NATURAL_COLLATOR.compare(left, right))
    .map(([name, value]) => {
      if (typeof value !== "string")
        return `${indentation}${renderName(name)}: {\n${renderTree(value, `${indentation}  `)}\n${indentation}},`;
      const line = `${indentation}${renderName(name)}: ${JSON.stringify(value)},`;
      // A line over the width breaks after its colon, as the formatter breaks it, so the value stands on the next line
      if (line.length <= RENDERED_LINE_WIDTH) return line;
      return `${indentation}${renderName(name)}:\n${indentation}  ${JSON.stringify(value)},`;
    })
    .join("\n");
