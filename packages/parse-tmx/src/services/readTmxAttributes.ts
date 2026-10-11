import type { TMXAttributes } from "#src/models/tmx/TMXAttributes";

import { AttributeKind } from "#src/models/AttributeKind";
import { InvalidOperationError, Operation } from "@esposter/shared";

type TMXAttributeValue<Kind extends AttributeKind> = Kind extends TMXNumberKind ? number : string;
// The model an element table reads as: a required kind is always a key, an optional one a key only when written
type TMXAttributeValues<Table extends Record<string, AttributeKind>> = {
  [Name in keyof Table as Table[Name] extends TMXRequiredKind ? Name : never]: TMXAttributeValue<Table[Name]>;
} & {
  [Name in keyof Table as Table[Name] extends TMXRequiredKind ? never : Name]?: TMXAttributeValue<Table[Name]>;
};
type TMXNumberKind = AttributeKind.Number | AttributeKind.RequiredNumber;

type TMXRequiredKind = AttributeKind.RequiredNumber | AttributeKind.RequiredString;

// An attribute left out or written empty is absent rather than zero, since `Number("")` would read it as zero. A
// String attribute written empty is kept, as the document wrote it.
export const readTmxAttributes = <Table extends Record<string, AttributeKind>>(
  attributes: TMXAttributes,
  table: Table,
): TMXAttributeValues<Table> => {
  const values: Record<string, number | string> = {};
  for (const [name, kind] of Object.entries(table)) {
    const isNumber = kind === AttributeKind.Number || kind === AttributeKind.RequiredNumber;
    const isRequired = kind === AttributeKind.RequiredNumber || kind === AttributeKind.RequiredString;
    const text = attributes[name];
    if (text === undefined || (isNumber && text === "")) {
      if (isRequired) values[name] = isNumber ? 0 : "";
    } else if (isNumber) {
      const number = Number(text);
      if (Number.isNaN(number))
        throw new InvalidOperationError(Operation.Read, readTmxAttributes.name, `${text} is not a number`);
      values[name] = number;
    } else values[name] = text;
  }
  // The table names every required key, which the loop above always writes, so the record is the model's shape
  return values as TMXAttributeValues<Table>;
};
