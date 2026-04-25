/* eslint-disable @typescript-eslint/no-explicit-any */
import { takeOne } from "@/util/array/takeOne";

const reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.{0,1}\d*))(?:Z|(\+|-)([\d|:]*))?$/;
const reMsAjax = /^\/Date\((d|-|.*)\)[/|\\]$/;
// oxlint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export const jsonDateParse = <T = any>(text: string): T =>
  JSON.parse(text, (_key, value) => {
    let parsedValue = value;

    if (typeof value === "string") {
      let a = reISO.exec(value);

      if (a) parsedValue = new Date(value);
      else {
        a = reMsAjax.exec(value);

        if (a) {
          const b = takeOne(a, 1).split(/[-+,.]/);
          parsedValue = new Date(b[0] ? Number(b[0]) : 0 - Number(b[1]));
        }
      }
    }

    return parsedValue;
  });
