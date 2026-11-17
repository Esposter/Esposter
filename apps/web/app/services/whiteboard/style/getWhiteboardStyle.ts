import type { PositionedElement, PositionedElementProperty } from "vue-block-editor-headless";

import { ArrowEndKey, checkIsPositionedElementPropertyHeld, PositionedElementType } from "vue-block-editor-headless";

// The look an element holds, as the property changes a paste applies to another element. Each field is read only where the holding rule says the
// Element holds it, so a copy carries exactly what a paste will apply. An alignment the element has not set is left out, so a paste keeps the target's own
export const getWhiteboardStyle = (element: PositionedElement): PositionedElementProperty[] => {
  const style: PositionedElementProperty[] = [];
  // Each `in` test narrows the element to the kinds that carry the field, so its value reads as the field's own type
  if ("color" in element && checkIsPositionedElementPropertyHeld(element, "color"))
    style.push({ property: "color", value: element.color });
  if ("strokeWidth" in element && checkIsPositionedElementPropertyHeld(element, "strokeWidth"))
    style.push({ property: "strokeWidth", value: element.strokeWidth });
  if ("dashPattern" in element && checkIsPositionedElementPropertyHeld(element, "dashPattern"))
    style.push({ property: "dashPattern", value: element.dashPattern });
  if ("sketchLevel" in element && checkIsPositionedElementPropertyHeld(element, "sketchLevel"))
    style.push({ property: "sketchLevel", value: element.sketchLevel });
  if ("fill" in element && checkIsPositionedElementPropertyHeld(element, "fill"))
    style.push({ property: "fill", value: element.fill });
  if ("cornerStyle" in element && checkIsPositionedElementPropertyHeld(element, "cornerStyle"))
    style.push({ property: "cornerStyle", value: element.cornerStyle });
  if ("textSize" in element && checkIsPositionedElementPropertyHeld(element, "textSize"))
    style.push({ property: "textSize", value: element.textSize });
  if (
    "horizontalAlignment" in element &&
    element.horizontalAlignment &&
    checkIsPositionedElementPropertyHeld(element, "horizontalAlignment")
  )
    style.push({ property: "horizontalAlignment", value: element.horizontalAlignment });
  if (
    "verticalAlignment" in element &&
    element.verticalAlignment &&
    checkIsPositionedElementPropertyHeld(element, "verticalAlignment")
  )
    style.push({ property: "verticalAlignment", value: element.verticalAlignment });
  // Both ends are carried, an end with no arrowhead included, so a paste clears the arrowhead a target holds at an end the copy lacks
  if (element.type === PositionedElementType.Arrow && checkIsPositionedElementPropertyHeld(element, "arrowhead"))
    for (const end of [ArrowEndKey.Start, ArrowEndKey.End])
      style.push({ end, property: "arrowhead", value: element[end].arrowhead });

  return style;
};
