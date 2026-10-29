import type { WebpageNodeTypeDefinition } from "#shared/models/pageBuilder/webpage/WebpageNodeTypeDefinition";

import { ElementAttribute } from "#shared/models/pageBuilder/html/ElementAttribute";
import { ElementTag } from "#shared/models/pageBuilder/html/ElementTag";
import { typedTextPropsSchema } from "#shared/models/pageBuilder/webpage/TypedTextProps";
import { WebpageNodeType } from "#shared/models/pageBuilder/webpage/WebpageNodeType";
import { createElement } from "#shared/services/pageBuilder/html/createElement";
import { createText } from "#shared/services/pageBuilder/html/createText";
import { toBooleanAttribute } from "#shared/services/pageBuilder/html/toBooleanAttribute";
import {
  TYPED_TEXT_CLASS,
  TYPED_TEXT_CSS,
  TYPED_TEXT_SCRIPT,
  VISUALLY_HIDDEN_CLASS,
} from "#shared/services/pageBuilder/webpage/typedText/constants";
import { takeOne } from "@esposter/shared";

export const TypedTextDefinition = {
  createProps: () => ({ isLoop: true, strings: ["Typed", "text"], style: {} }),
  createPropsSchema: () => typedTextPropsSchema,
  css: TYPED_TEXT_CSS,
  // Every string is read as the element's text, and the typing itself is hidden from assistive technology
  render: ({ isLoop, strings }) =>
    createElement(
      ElementTag.Span,
      {
        [ElementAttribute.Class]: TYPED_TEXT_CLASS,
        [ElementAttribute.DataLoop]: toBooleanAttribute(isLoop),
        [ElementAttribute.DataStrings]: JSON.stringify(strings),
      },
      [
        createElement(ElementTag.Span, { [ElementAttribute.Class]: VISUALLY_HIDDEN_CLASS }, [
          createText(strings.join(", ")),
        ]),
        createElement(ElementTag.Span, { [ElementAttribute.AriaHidden]: "true" }, [createText(takeOne(strings))]),
      ],
    ),
  script: TYPED_TEXT_SCRIPT,
  slots: {},
  type: WebpageNodeType.TypedText,
} satisfies WebpageNodeTypeDefinition<WebpageNodeType.TypedText>;
