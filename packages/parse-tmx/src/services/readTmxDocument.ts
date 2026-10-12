import type { TMXAttributes } from "#src/models/tmx/TMXAttributes";
import type { TMXFrame } from "#src/models/tmx/TMXFrame";
import type { TMXReadContext } from "#src/models/tmx/TMXReadContext";
import type { QualifiedAttribute } from "sax";

import { closeTmxFrame } from "#src/services/closeTmxFrame";
import { openTmxFrame } from "#src/services/openTmxFrame";
import { InvalidOperationError, Operation } from "@esposter/shared";
import sax from "sax";

// A byte order mark is not part of the document, and sax would refuse it
const BYTE_ORDER_MARK_REGEX = /^\uFEFF/u;

// Sax types an attribute as its value, or as the qualified attribute that wraps it when namespaces are read. This reader
// Reads no namespaces, so every attribute is the value it holds.
const toTmxAttributes = (attributes: Record<string, QualifiedAttribute | string>): TMXAttributes =>
  Object.fromEntries(
    Object.entries(attributes).map(([name, attribute]) => [
      name,
      typeof attribute === "string" ? attribute : attribute.value,
    ]),
  );

// One sax pass over the document, each element opening its frame and closing into it, and the root's frame is what it
// Returns. sax reports malformed input through `onerror`, which throws so the first error is the one the caller
// Receives. An element with no frame is inside a subtree the reader does not model, so its own children are undefined too.
export const readTmxDocument = (xmlString: string, context: TMXReadContext): TMXFrame | undefined => {
  const parser = sax.parser(true, { normalize: false, trim: false });
  const stack: (TMXFrame | undefined)[] = [];
  let root: TMXFrame | undefined;

  parser.onerror = (error) => {
    throw new InvalidOperationError(Operation.Read, readTmxDocument.name, error.message);
  };
  parser.onopentag = (node) => {
    if (stack.length === 0) {
      root = openTmxFrame(undefined, node.name, toTmxAttributes(node.attributes), context);
      stack.push(root);
      return;
    }
    const parent = stack.at(-1);
    stack.push(parent && openTmxFrame(parent, node.name, toTmxAttributes(node.attributes), context));
  };
  parser.onclosetag = () => {
    const frame = stack.pop();
    if (frame) closeTmxFrame(frame);
  };
  const appendText = (text: string): void => {
    const frame = stack.at(-1);
    if (frame) frame.text += text;
  };
  parser.ontext = appendText;
  parser.oncdata = appendText;
  parser.write(xmlString.replace(BYTE_ORDER_MARK_REGEX, "")).close();

  return root;
};
