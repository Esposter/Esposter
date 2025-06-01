const reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.{0,1}\d*))(?:Z|(\+|-)([\d|:]*))?$/;
const reMsAjax = /^\/Date\((d|-|.*)\)[/|\\]$/;

export const jsonDateParse = (text: string) =>
  JSON.parse(text, (_key, value) => {
    let parsedValue = value;

    if (typeof value === "string") {
      let a = reISO.exec(value);

      if (a) parsedValue = new Date(value);
      else {
        a = reMsAjax.exec(value);

        if (a) {
          const b = a[1].split(/[-+,.]/);
          parsedValue = new Date(b[0] ? +b[0] : 0 - +b[1]);
        }
      }
    }

    return parsedValue;
  });
