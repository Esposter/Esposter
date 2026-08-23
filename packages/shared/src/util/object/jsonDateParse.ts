// oxlint-disable typescript/no-explicit-any
import { takeOne } from "#src/util/array/takeOne";

const ISO_DATE_REGEX =
  /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})T(?<hours>\d{2}):(?<minutes>\d{2}):(?<seconds>\d{2}(?:\.{0,1}\d*))(?:Z|(?<sign>\+|-)(?<offset>[\d|:]*))?$/u;
const MS_AJAX_DATE_REGEX = /^\/Date\((?<timestamp>-?\d+(?:[-+]\d+)?)\)[/\\]$/u;
// oxlint-disable-next-line typescript/no-unnecessary-type-parameters
export const jsonDateParse = <T = any>(text: string): T =>
  // eslint-disable-next-line no-restricted-syntax -- the reviver every other caller is pointed at is built here
  JSON.parse(text, (_key, value) => {
    if (typeof value !== "string") return value;
    else if (ISO_DATE_REGEX.test(value)) return new Date(value);

    const msAjaxDateMatch = MS_AJAX_DATE_REGEX.exec(value);
    if (!msAjaxDateMatch) return value;

    const timestampParts = takeOne(msAjaxDateMatch, 1).split(/[-+,.]/u);
    return new Date(timestampParts[0] ? Number(timestampParts[0]) : 0 - Number(timestampParts[1]));
  });
