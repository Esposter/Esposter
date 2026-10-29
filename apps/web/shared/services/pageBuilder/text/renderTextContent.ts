import type { HtmlNode } from "#shared/models/pageBuilder/html/HtmlNode";
import type { OpenMark } from "#shared/models/pageBuilder/text/OpenMark";
import type { JSONContent } from "@tiptap/core";
import type { Fragment, Mark, Node, Schema } from "@tiptap/pm/model";

import { createText } from "#shared/services/pageBuilder/html/createText";
import { renderDomOutputSpec } from "#shared/services/pageBuilder/text/renderDomOutputSpec";
import { InvalidOperationError, Operation } from "@esposter/shared";

const renderNode = (node: Node): HtmlNode[] => {
  if (node.isText) return [createText(node.text ?? "")];

  const toDOM = node.type.spec.toDOM;
  if (!toDOM) throw new InvalidOperationError(Operation.Read, node.type.name, "renders to nothing");
  const { hole, node: element } = renderDomOutputSpec(toDOM(node));
  // oxlint-disable-next-line typescript/no-use-before-define -- a node's content is a fragment, and a fragment holds nodes
  if (hole) hole.push(...renderFragment(node.content));
  return [element];
};
// Adjacent inline nodes sharing a mark share its element, as ProseMirror's own serialiser groups them, so a bold run
// Split by an italic word stays one strong element
const renderFragment = (fragment: Fragment): HtmlNode[] => {
  const nodes: HtmlNode[] = [];
  let openMarks: OpenMark[] = [];
  fragment.forEach((child) => {
    let keptMarkCount = 0;
    while (
      keptMarkCount < openMarks.length &&
      keptMarkCount < child.marks.length &&
      openMarks[keptMarkCount]?.mark.eq(child.marks[keptMarkCount] as Mark)
    )
      keptMarkCount++;
    openMarks = openMarks.slice(0, keptMarkCount);

    for (const mark of child.marks.slice(keptMarkCount)) {
      const toDOM = mark.type.spec.toDOM;
      if (!toDOM) throw new InvalidOperationError(Operation.Read, mark.type.name, "renders to nothing");
      const { hole, node } = renderDomOutputSpec(toDOM(mark, true));
      (openMarks.at(-1)?.hole ?? nodes).push(node);
      if (hole) openMarks.push({ hole, mark });
    }

    (openMarks.at(-1)?.hole ?? nodes).push(...renderNode(child));
  });
  return nodes;
};

export const renderTextContent = (content: JSONContent, schema: Schema): HtmlNode[] =>
  renderFragment(schema.nodeFromJSON(content).content);
