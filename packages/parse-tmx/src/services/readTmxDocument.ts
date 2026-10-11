import type { TMXDocument } from "#src/models/tmx/TMXDocument";
import type { TMXFrame } from "#src/models/tmx/TMXFrame";
import type { TMXReadContext } from "#src/models/tmx/TMXReadContext";

import { TMXTagName } from "#src/models/tmx/TMXTagName";
import { closeTmxFrame } from "#src/services/closeTmxFrame";
import { openTmxFrame } from "#src/services/openTmxFrame";
import { openTmxRoot } from "#src/services/openTmxRoot";
import { readTmxAttributes } from "#src/services/readTmxAttributes";
import { InvalidOperationError, Operation } from "@esposter/shared";
import sax from "sax";

// A byte order mark is not part of the document, and sax would refuse it
const BYTE_ORDER_MARK_REGEX = /^﻿/u;

// One sax pass over the document, each element opening its frame and closing into it. sax reports malformed input
// Through `onerror`, which throws so the first error is the one the caller receives. An element with no frame is inside
// A subtree the reader does not model, so its own children are undefined too.
export const readTmxDocument = (xmlString: string): TMXDocument => {
  const parser = sax.parser(true, { normalize: false, trim: false });
  const context: TMXReadContext = { pending: [], tileCount: 0 };
  const stack: (TMXFrame | undefined)[] = [];
  let root: TMXFrame | undefined;

  parser.onerror = (error) => {
    throw new InvalidOperationError(Operation.Read, readTmxDocument.name, error.message);
  };
  parser.onopentag = (node) => {
    if (stack.length === 0) {
      root = openTmxRoot(node.name, readTmxAttributes(node.attributes));
      if (root?.tag === TMXTagName.Map) context.tileCount = root.target.width * root.target.height;
      stack.push(root);
      return;
    }
    const parent = stack.at(-1);
    stack.push(parent && openTmxFrame(parent, node.name, readTmxAttributes(node.attributes), context));
  };
  parser.onclosetag = () => {
    const frame = stack.pop();
    if (frame) closeTmxFrame(frame);
  };
  parser.ontext = (text) => {
    const frame = stack.at(-1);
    if (frame) frame.text += text;
  };
  parser.oncdata = (text) => {
    const frame = stack.at(-1);
    if (frame) frame.text += text;
  };
  parser.write(xmlString.replace(BYTE_ORDER_MARK_REGEX, "")).close();

  return { context, root };
};
