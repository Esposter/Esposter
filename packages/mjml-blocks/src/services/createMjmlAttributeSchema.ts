import type { MjmlAttributeType } from "#src/models/MjmlAttributeType";

import { MjmlAttributeKind } from "#src/models/MjmlAttributeKind";
import { checkIsMjmlAddressAttribute } from "#src/services/checkIsMjmlAddressAttribute";
import { ALLOWED_URL_SCHEMES, MJML_COLOR_MATCHERS } from "#src/services/constants";
import { checkIsAllowedUrl, exhaustiveGuard } from "@esposter/shared";
import { z } from "zod";

// MJML's own pattern for a unit: values of one unit each, or 0, repeated within its count, matched as its validator matches them
const createUnitPattern = (units: string[], allowsNegative: boolean, minCount: number, maxCount: number): RegExp => {
  const numeric = allowsNegative ? "-|\\d|,|\\." : "\\d|,|\\.";
  const filteredUnits = units
    .filter((unit) => unit !== "auto")
    .map((unit) => RegExp.escape(unit))
    .join("|");
  const autoAlternative = units.includes("auto") ? "|auto" : "";
  return new RegExp(`^(((${numeric}){1,}(${filteredUnits})|0${autoAlternative})( )?){${minCount},${maxCount}}$`, "u");
};

const createTypeSchema = (type: MjmlAttributeType): z.ZodType<string> => {
  switch (type.kind) {
    case MjmlAttributeKind.Boolean:
      return z.string().refine((value) => ["false", "true"].includes(value));
    case MjmlAttributeKind.Color:
      return z.string().refine((value) => MJML_COLOR_MATCHERS.some((matcher) => matcher.test(value)));
    case MjmlAttributeKind.Enum:
      return z.string().refine((value) => type.options.includes(value));
    case MjmlAttributeKind.Integer:
      return z.string().regex(/\d+/u);
    case MjmlAttributeKind.String:
      return z.string();
    case MjmlAttributeKind.Unit:
      return z.string().regex(createUnitPattern(type.units, type.allowsNegative, type.minCount, type.maxCount));
    default:
      return exhaustiveGuard(type);
  }
};

// The schema of one attribute's value, accepting what MJML's validator for its type accepts, and for an address only a scheme that is allowed
export const createMjmlAttributeSchema = (type: MjmlAttributeType, name: string): z.ZodType<string> => {
  const schema = createTypeSchema(type);
  return checkIsMjmlAddressAttribute(name)
    ? schema.refine((url) => checkIsAllowedUrl(url, ALLOWED_URL_SCHEMES), "has a scheme that is not allowed")
    : schema;
};
