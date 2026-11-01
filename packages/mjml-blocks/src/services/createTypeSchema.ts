import type { MjmlAttributeType } from "#src/models/MjmlAttributeType";

import { MjmlAttributeKind } from "#src/models/MjmlAttributeKind";
import { MJML_COLOR_MATCHERS, MJML_VALUE_MAX_LENGTH } from "#src/services/constants";
import { createUnitPattern } from "#src/services/createUnitPattern";
import { exhaustiveGuard } from "@esposter/shared";
import { z } from "zod";

export const createTypeSchema = (type: MjmlAttributeType): z.ZodType<string> => {
  // Every branch starts from one bounded string, so no value a branch checks is longer than a value may be
  const boundedString = z.string().max(MJML_VALUE_MAX_LENGTH);
  switch (type.kind) {
    case MjmlAttributeKind.Boolean:
      return boundedString.refine((value) => ["false", "true"].includes(value));
    case MjmlAttributeKind.Color:
      return boundedString.refine((value) => MJML_COLOR_MATCHERS.some((matcher) => matcher.test(value)));
    case MjmlAttributeKind.Enum:
      return boundedString.refine((value) => type.options.includes(value));
    case MjmlAttributeKind.Integer:
      return boundedString.regex(/^\d+$/u);
    case MjmlAttributeKind.String:
      return boundedString;
    case MjmlAttributeKind.Unit:
      return boundedString.regex(createUnitPattern(type.units, type.isNegativeAllowed, type.minCount, type.maxCount));
    default:
      return exhaustiveGuard(type);
  }
};
