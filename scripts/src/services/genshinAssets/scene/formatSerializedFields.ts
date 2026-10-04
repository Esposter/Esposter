import type { SerializedField } from "#src/models/genshinAssets/scene/SerializedField";
import type { ObjectPointer } from "#src/models/genshinAssets/shared/ObjectPointer";

import { SerializedFieldKind } from "#src/models/genshinAssets/scene/SerializedFieldKind";
import { formatNumbers } from "#src/services/genshinAssets/shared/formatNumbers";
import { exhaustiveGuard } from "@esposter/shared";

// A script's scanned fields as text, one a line by its offset in hexadecimal, a pointer named by what it points at and
// An array's records indented beneath it
export const formatSerializedFields = (
  fields: readonly SerializedField[],
  describePointer: (pointer: ObjectPointer) => string,
  depth = 0,
): string =>
  fields
    .map((field) => {
      const line = (text: string): string => `${"  ".repeat(depth)}0x${field.offset.toString(16)} ${text}`;
      switch (field.kind) {
        case SerializedFieldKind.Array:
          return [
            line(`array of ${field.elements.length}`),
            formatSerializedFields(field.elements, describePointer, depth + 1),
          ].join("\n");
        case SerializedFieldKind.Color:
          return line(`colour ${formatNumbers(field.color)}`);
        case SerializedFieldKind.Curve:
          return line(
            `curve ${field.keys.map(({ inSlope, outSlope, time, value }) => `(${formatNumbers([time, value, inSlope, outSlope])})`).join(" ")}`,
          );
        case SerializedFieldKind.Float:
        case SerializedFieldKind.Integer:
          return line(`${field.kind} ${field.value}`);
        case SerializedFieldKind.Gradient:
          return line(
            `gradient ${field.colorKeys.map(({ color, time }) => `${formatNumbers([time])}:${formatNumbers(color)}`).join(" ")}, alpha ${field.alphaKeys.map(({ alpha, time }) => `${formatNumbers([time])}:${formatNumbers([alpha])}`).join(" ")}`,
          );
        case SerializedFieldKind.Pointer:
          return line(`pointer ${describePointer(field.pointer)}`);
        default:
          return exhaustiveGuard(field);
      }
    })
    .join("\n");
