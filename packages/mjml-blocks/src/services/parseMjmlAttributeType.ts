import type { MjmlAttributeType } from "#src/models/MjmlAttributeType";

import { MjmlAttributeKind } from "#src/models/MjmlAttributeKind";
import { InvalidOperationError, Operation } from "@esposter/shared";

const ENUM_GRAMMAR_REGEX = /^enum\((?<options>[^)]*)\)$/u;
const UNIT_GRAMMAR_REGEX =
  /^(?<kind>unit|unitWithNegative)\((?<units>[^)]*)\)(?:\{(?<minCount>\d+)(?:,(?<maxCount>\d+))?\})?$/u;

// Reads one attribute's type from MJML's grammar, as the component tables write it, refusing a grammar it does not know
export const parseMjmlAttributeType = (grammar: string): MjmlAttributeType => {
  switch (grammar) {
    case "boolean":
      return { kind: MjmlAttributeKind.Boolean };
    case "color":
      return { kind: MjmlAttributeKind.Color };
    case "integer":
      return { kind: MjmlAttributeKind.Integer };
    case "string":
      return { kind: MjmlAttributeKind.String };
  }

  const options = ENUM_GRAMMAR_REGEX.exec(grammar)?.groups?.options;
  if (options !== undefined) return { kind: MjmlAttributeKind.Enum, options: options.split(",") };

  const unit = UNIT_GRAMMAR_REGEX.exec(grammar)?.groups;
  if (unit) {
    const minCount = Number(unit.minCount ?? "1");
    return {
      allowsNegative: unit.kind === "unitWithNegative",
      kind: MjmlAttributeKind.Unit,
      maxCount: Number(unit.maxCount ?? unit.minCount ?? "1"),
      minCount,
      units: (unit.units ?? "").split(","),
    };
  }

  throw new InvalidOperationError(Operation.Read, grammar, "is not an MJML attribute type");
};
