import type { TMXFrame } from "#src/models/tmx/TMXFrame";
import type { TMXReadContext } from "#src/models/tmx/TMXReadContext";

import { closeTmxFrame } from "#src/services/closeTmxFrame";
import { openTmxFrame } from "#src/services/openTmxFrame";
import { tokenizeXml } from "#src/services/tokenizeXml";

// One pass over the document, each element opening its frame and closing into it, and the root's frame is what it
// Returns. A malformed document throws from the tokenizer, so the first error is the one the caller receives. An
// Element with no frame is inside a subtree the reader does not model, so its own children are undefined too.
export const readTmxDocument = (xmlString: string, context: TMXReadContext): TMXFrame | undefined => {
  const stack: (TMXFrame | undefined)[] = [];
  let root: TMXFrame | undefined;

  tokenizeXml(xmlString, {
    onCloseTag: () => {
      const frame = stack.pop();
      if (frame) closeTmxFrame(frame);
    },
    onOpenTag: (name, attributes) => {
      if (stack.length === 0) {
        root = openTmxFrame(undefined, name, attributes, context);
        stack.push(root);
        return;
      }
      const parent = stack.at(-1);
      stack.push(parent && openTmxFrame(parent, name, attributes, context));
    },
    onText: (text) => {
      const frame = stack.at(-1);
      if (frame) frame.text += text;
    },
  });

  return root;
};
