import type { WebpageNodeTypeDefinition } from "#shared/models/pageBuilder/webpage/WebpageNodeTypeDefinition";

import { ElementAttribute } from "#shared/models/pageBuilder/html/ElementAttribute";
import { ElementTag } from "#shared/models/pageBuilder/html/ElementTag";
import { TooltipPosition } from "#shared/models/pageBuilder/webpage/TooltipPosition";
import { tooltipPropsSchema } from "#shared/models/pageBuilder/webpage/TooltipProps";
import { WebpageNodeType } from "#shared/models/pageBuilder/webpage/WebpageNodeType";
import { createElement } from "#shared/services/pageBuilder/html/createElement";
import { createText } from "#shared/services/pageBuilder/html/createText";
import { TOOLTIP_CLASS } from "#shared/services/pageBuilder/webpage/tooltip/constants";
import { getTooltipCss } from "#shared/services/pageBuilder/webpage/tooltip/getTooltipCss";
import { getTooltipPositionClass } from "#shared/services/pageBuilder/webpage/tooltip/getTooltipPositionClass";
import { getTooltipId } from "#shared/services/pageBuilder/webpage/tooltip/getTooltipId";

export const TooltipDefinition = {
  createProps: () => ({ position: TooltipPosition.Top, style: {}, text: "Text", tooltipText: "Tooltip" }),
  createPropsSchema: () => tooltipPropsSchema,
  css: getTooltipCss(),
  render: ({ id, position, text, tooltipText }) =>
    createElement(
      ElementTag.Span,
      { [ElementAttribute.Class]: `${TOOLTIP_CLASS} ${getTooltipPositionClass(position)}` },
      [
        createElement(
          ElementTag.Span,
          { [ElementAttribute.AriaDescribedBy]: getTooltipId(id), [ElementAttribute.TabIndex]: "0" },
          [createText(text)],
        ),
        createElement(
          ElementTag.Span,
          { [ElementAttribute.Id]: getTooltipId(id), [ElementAttribute.Role]: "tooltip" },
          [createText(tooltipText)],
        ),
      ],
    ),
  slots: {},
  type: WebpageNodeType.Tooltip,
} satisfies WebpageNodeTypeDefinition<WebpageNodeType.Tooltip>;
