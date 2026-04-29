import { BinaryOperators } from "@esposter/db-schema";
import { ID_SEPARATOR } from "@esposter/shared";

const VALUE_REGEX = [
  true,
  false,
  // ISO-8601 datetimes
  String.raw`\d{4}-\d{2}-\d{2}T[^\s]+`,
  String(null),
  // Numbers
  String.raw`-?\d+(?:\.\d+)?`,
  String(Number.NaN),
  // Quoted strings
  "'[^']*'",
].join(ID_SEPARATOR);
// oxlint-disable-next-line typescript/no-inferrable-types
export const CLAUSE_REGEX: RegExp = new RegExp(
  `^(?<not>not\\s+)?(?<key>[A-Za-z0-9_]*)\\s*(?<operator>${[...BinaryOperators].join(ID_SEPARATOR)})\\s+(?<value>${VALUE_REGEX})$`,
  "i",
);
