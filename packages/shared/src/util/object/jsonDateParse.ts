// oxlint-disable typescript/no-explicit-any
import { takeOne } from "@/util/array/takeOne";

const ISO_DATE_REGEX =
  /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})T(?<hours>\d{2}):(?<minutes>\d{2}):(?<seconds>\d{2}(?:\.{0,1}\d*))(?:Z|(?<sign>\+|-)(?<offset>[\d|:]*))?$/u;
const MS_AJAX_DATE_REGEX = /^\/Date\((?<timestamp>-?\d+(?:[-+]\d+)?)\)[/\\]$/u;
// oxlint-disable-next-line typescript/no-unnecessary-type-parameters
export const jsonDateParse = <T = any>(text: string): T =>
  // eslint-disable-next-line no-restricted-syntax -- the reviver every other caller is pointed at is built here
  JSON.parse(text, (_key, value) => {
    let parsedValue = value;

    if (typeof value === "string") {
      if (ISO_DATE_REGEX.test(value)) parsedValue = new Date(value);
      else {
        const msAjaxDateMatch = MS_AJAX_DATE_REGEX.exec(value);

        if (msAjaxDateMatch) {
          const timestampParts = takeOne(msAjaxDateMatch, 1).split(/[-+,.]/u);
          parsedValue = new Date(timestampParts[0] ? Number(timestampParts[0]) : 0 - Number(timestampParts[1]));
        }
      }
    }

    return parsedValue;
  });
