/* eslint-disable @typescript-eslint/no-explicit-any */
import { takeOne } from "@/util/array/takeOne";

const ISO_DATE_REGEX =
  /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})T(?<hours>\d{2}):(?<minutes>\d{2}):(?<seconds>\d{2}(?:\.{0,1}\d*))(?:Z|(?<sign>\+|-)(?<offset>[\d|:]*))?$/u;
const MS_AJAX_DATE_REGEX = /^\/Date\((?<timestamp>-?\d+(?:[-+]\d+)?)\)[/\\]$/u;
// oxlint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export const jsonDateParse = <T = any>(text: string): T =>
  JSON.parse(text, (_key, value) => {
    let parsedValue = value;

    if (typeof value === "string") {
      let a = ISO_DATE_REGEX.exec(value);

      if (a) parsedValue = new Date(value);
      else {
        a = MS_AJAX_DATE_REGEX.exec(value);

        if (a) {
          const b = takeOne(a, 1).split(/[-+,.]/u);
          parsedValue = new Date(b[0] ? Number(b[0]) : 0 - Number(b[1]));
        }
      }
    }

    return parsedValue;
  });
