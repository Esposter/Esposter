import { BinaryOperators } from "#src/models/shared/BinaryOperator";

// Opens the literal Azure Table OData wraps a DateTime comparison in: datetime'<iso>'
export const DATETIME_LITERAL_PREFIX = "datetime'";
const VALUE_REGEX = [
  true,
  false,
  String.raw`${DATETIME_LITERAL_PREFIX}[^']*'`,
  // ISO-8601 datetimes
  String.raw`\d{4}-\d{2}-\d{2}T[^\s]+`,
  String(null),
  // Numbers
  String.raw`-?\d+(?:\.\d+)?`,
  String(Number.NaN),
  // Quoted strings, whose embedded quotes are escaped by being doubled
  "'(?:[^']|'')*'",
].join("|");
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const CLAUSE_REGEX: RegExp = new RegExp(
  String.raw`^(?<not>not\s+)?(?<key>[A-Za-z0-9_]*)\s*(?<operator>${BinaryOperators.join("|")})\s+(?<value>${VALUE_REGEX})$`,
  "iu",
);
