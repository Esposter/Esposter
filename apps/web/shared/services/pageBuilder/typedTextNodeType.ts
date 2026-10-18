import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { takeOne } from "@esposter/shared";
import { z } from "zod";

const typedTextFormSchema = z.strictObject({ texts: z.array(z.string().min(1)).min(1) });
const typedTextPropsSchema = z.strictObject({ ...typedTextFormSchema.shape, id: z.string() });

// Serialised with toString() and run in the page, so it names nothing outside its own body. The texts are typed out and
// Deleted in turn, unless the reader prefers reduced motion, when the whole text stands still
const typedTextScript = () => {
  const TYPE_DELAY = 80;
  const HOLD_DELAY = 1500;

  for (const element of document.querySelectorAll<HTMLElement>(".typed-text > [data-texts]")) {
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
      if (deleting) {
        if (count > 0) count--;
        else {
          deleting = false;
          index = (index + 1) % texts.length;
        }
      } else if (count < (texts[index] ?? "").length) count++;
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
  propsSchema: typedTextPropsSchema,
  render: (node) => {
    const { texts } = typedTextPropsSchema.parse(node.props);
    return {
      attributes: { class: "typed-text", "aria-label": texts.join(", ") },
      children: [
        {
          attributes: { "aria-hidden": "true", "data-texts": JSON.stringify(texts) },
          children: [takeOne(texts, 0)],
          tag: "span",
        },
      ],
      tag: "span",
    };
  },
  script: typedTextScript,
  slots: {},
  type: WebpageNodeType.TypedText,
} satisfies NodeTypeDefinition;
