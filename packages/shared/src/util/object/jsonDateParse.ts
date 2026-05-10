/* eslint-disable @typescript-eslint/no-explicit-any */
import { takeOne } from "@/util/array/takeOne";

const ISO_DATE_REGEX = new RegExp(
  String.raw`^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.{0,1}\d*))(?:Z|(\+|-)([\d|:]*))?$`,
  "u",
);
const MS_AJAX_DATE_REGEX = new RegExp(String.raw`^\/Date\((d|-|.*)\)[\/|\\]$`, "u");
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
          const b = takeOne(a, 1).split(new RegExp(String.raw`[-+,.]`, "u"));
          parsedValue = new Date(b[0] ? Number(b[0]) : 0 - Number(b[1]));
        }
      }
    }

    return parsedValue;
  });
