import type { TMXAttributes } from "#src/internal/models/tmx/TMXAttributes";
import type { TMXFrame } from "#src/internal/models/tmx/TMXFrame";

import { TMXTagName } from "#src/internal/models/tmx/TMXTagName";
import { createObject } from "#src/internal/services/createObject";
import { createTextProperties } from "#src/internal/services/createTextProperties";
import { openTmxProperties } from "#src/internal/services/openTmxProperties";
import { parsePoints } from "#src/internal/services/parsePoints";
import { Shape } from "#src/models/Shape";

type TMXObjectChildParent = Extract<TMXFrame, { tag: typeof TMXTagName.Object | typeof TMXTagName.Objectgroup }>;

// An object group holds objects, and an object holds the one shape it is, its properties and a text's content. A shape
// Is read off its element, so a point, ellipse, polygon or polyline child sets it on open.
export const openTmxObjectChild = (
  parent: TMXObjectChildParent,
  tag: TMXTagName | undefined,
  attributes: TMXAttributes,
): TMXFrame | undefined => {
  if (parent.tag === TMXTagName.Objectgroup) {
    if (tag === TMXTagName.Properties) return openTmxProperties(parent.target);
    if (tag !== TMXTagName.Object) return undefined;
    const object = createObject(attributes);
    parent.target.objects ??= [];
    parent.target.objects.push(object);
    return { tag, target: object, text: "" };
  }

  const object = parent.target;
  switch (tag) {
    case TMXTagName.Ellipse:
    case TMXTagName.Point:
      object.shape = tag === TMXTagName.Point ? Shape.Point : Shape.Ellipse;
      return { tag, target: object, text: "" };
    case TMXTagName.Polygon:
    case TMXTagName.Polyline:
      object.shape = tag === TMXTagName.Polygon ? Shape.Polygon : Shape.Polyline;
      object.points = parsePoints(attributes.points ?? "");
      return { tag, target: object, text: "" };
    case TMXTagName.Properties:
      return openTmxProperties(object);
    case TMXTagName.Text:
      object.properties = [...(object.properties ?? []), ...createTextProperties(attributes)];
      return { tag, target: object, text: "" };
    default:
      return undefined;
  }
};
