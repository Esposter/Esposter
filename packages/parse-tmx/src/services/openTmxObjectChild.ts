import type { TMXAttributes } from "#src/models/tmx/TMXAttributes";
import type { TMXFrame } from "#src/models/tmx/TMXFrame";
import type { TMXObjectParsed } from "#src/models/tmx/parsed/TMXObjectParsed";
import type { TMXPropertiesParsed } from "#src/models/tmx/parsed/TMXPropertiesParsed";

import { AttributeKind } from "#src/models/AttributeKind";
import { Shape } from "#src/models/Shape";
import { TMXTagName } from "#src/models/tmx/TMXTagName";
import { openTmxProperties } from "#src/services/openTmxProperties";
import { parseFlips } from "#src/services/parseFlips";
import { parseTileId } from "#src/services/parseTileId";
import { readTmxAttributes } from "#src/services/readTmxAttributes";

type TMXObjectChildParent = Extract<TMXFrame, { tag: TMXTagName.Object | TMXTagName.Objectgroup }>;

const NUMBER_REGEX = /^[+-]?\d+(?<decimal>\.\d+)?$/u;
const objectAttributeKindMap = {
  gid: AttributeKind.Number,
  height: AttributeKind.RequiredNumber,
  id: AttributeKind.RequiredNumber,
  name: AttributeKind.RequiredString,
  rotation: AttributeKind.Number,
  template: AttributeKind.String,
  type: AttributeKind.RequiredString,
  visible: AttributeKind.Number,
  width: AttributeKind.RequiredNumber,
  x: AttributeKind.RequiredNumber,
  y: AttributeKind.RequiredNumber,
} as const;

// A rectangle until a shape child says otherwise. A gid's flip bits are read off it, and its id is the tile without them
const createObject = (attributes: TMXAttributes): TMXObjectParsed => {
  const { gid, ...object } = readTmxAttributes(attributes, objectAttributeKindMap);
  const shaped: TMXObjectParsed = { ...object, shape: Shape.Rectangle };
  if (gid === undefined) return shaped;
  return gid ? { ...shaped, flips: parseFlips(gid), gid: parseTileId(gid) } : { ...shaped, gid };
};

// The `points` of a polygon or polyline: pairs written `x,y` and separated by spaces
const parsePoints = (points: string): [number, number][] =>
  points.split(" ").map((point) => {
    const [x = "", y = ""] = point.split(",");
    return [Number(x), Number(y)];
  });

// The value of an attribute that carries no type of its own, such as a text object's styling: a number where the text
// Reads as one, a boolean where it reads as one, and a string otherwise
const parseUntypedValue = (value: string): boolean | number | string => {
  if (value === "true") return true;
  else if (value === "false") return false;
  else if (NUMBER_REGEX.test(value)) return Number(value);
  else return value;
};

// A text object's styling is its attributes, which read as properties after the object's own
const createTextProperties = (attributes: TMXAttributes): TMXPropertiesParsed =>
  Object.entries(attributes).map(([name, value]) => ({ name, value: parseUntypedValue(value) }));

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
