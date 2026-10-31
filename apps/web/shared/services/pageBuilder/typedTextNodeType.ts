import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";
import type { TypedTextNode } from "#shared/models/pageBuilder/TypedTextNode";
import type { TypedTextNodeProps } from "#shared/models/pageBuilder/TypedTextNodeProps";
import type { OwnProps } from "headless-block-editor";

import { HtmlAttributeName } from "#shared/models/pageBuilder/HtmlAttributeName";
import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { nodeStyleSchema } from "#shared/models/pageBuilder/NodeStyle";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { MAX_TYPED_TEXT_COUNT } from "#shared/services/pageBuilder/constants";
import { nodeTextSchema } from "#shared/services/pageBuilder/nodeTextSchema";
import { takeOne } from "@esposter/shared";
import { z } from "zod";

const typedTextFormSchema = z.strictObject({ texts: z.array(nodeTextSchema).min(1).max(MAX_TYPED_TEXT_COUNT) });
const typedTextPropsSchema = z.object({
  ...typedTextFormSchema.shape,
  style: nodeStyleSchema.optional(),
}) satisfies z.ZodType<OwnProps<TypedTextNodeProps>>;

// Serialised with toString() and run in the page, so it names nothing outside its own body. The texts are typed out and
// Deleted in turn, unless the reader prefers reduced motion, when the whole text stands still
const typedTextScript = () => {
  const TYPE_DELAY = 80;
  const HOLD_DELAY = 1500;

  for (const element of window.document.querySelectorAll<HTMLElement>(".typed-text > [data-texts]")) {
    // oxlint-disable-next-line no-restricted-properties -- the page script cannot import jsonDateParse, and a typed text that is ISO-shaped must stay a string
    const texts: string[] = JSON.parse(element.dataset.texts ?? "[]");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      element.textContent = texts.join(", ");
      continue;
    }

    let index = 0;
    let count = (texts[0] ?? "").length;
    let deleting = false;
    const tick = () => {
      if (!element.isConnected) return;

      let delay = TYPE_DELAY;
      if (deleting)
        if (count > 0) count--;
        else {
          deleting = false;
          index = (index + 1) % texts.length;
        }
      else if (count < (texts[index] ?? "").length) count++;
      else {
        deleting = true;
        delay = HOLD_DELAY;
      }
      element.textContent = (texts[index] ?? "").slice(0, count);
      window.setTimeout(tick, delay);
    };
    window.setTimeout(tick, HOLD_DELAY);
  }
};

// Text that types itself out, with its whole text as the accessible name, since the typed copy is hidden from a screen reader
export const typedTextNodeType = {
  css: "",
  formSchema: typedTextFormSchema,
  isFocusable: false,
  propsSchema: typedTextPropsSchema,
  render: (node) => ({
    attributes: { [HtmlAttributeName.AriaLabel]: node.props.texts.join(", "), [HtmlAttributeName.Class]: "typed-text" },
    children: [
      {
        attributes: {
          [HtmlAttributeName.AriaHidden]: "true",
          [HtmlAttributeName.DataTexts]: JSON.stringify(node.props.texts),
        },
        children: [takeOne(node.props.texts, 0)],
        tag: HtmlTag.Span,
      },
    ],
    tag: HtmlTag.Span,
  }),
  script: typedTextScript,
  slots: {},
  type: WebpageNodeType.TypedText,
} satisfies NodeTypeDefinition<TypedTextNode>;
