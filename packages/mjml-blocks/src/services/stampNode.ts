import type { MjmlJson } from "#src/models/MjmlJson";
import type { BlockNode } from "headless-block-editor";

import { escapeAttribute } from "@esposter/shared";
import { z } from "zod";

// A node's output gains its id as its css-class when the render stamps ids, so the proof can find its box in the email
export const stampNode = (output: MjmlJson, node: BlockNode, isStampingIds: boolean): MjmlJson => {
  if (!isStampingIds) return output;

  const id = z.string().parse(node.props.id);
  return { ...output, attributes: { ...output.attributes, "css-class": escapeAttribute(id) } };
};
