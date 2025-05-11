export const parseXmlValue = (value: string): boolean | number | string => {
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^[+-]?\d+(\.\d+)?$/g.test(value)) {
    const parsedValue = parseFloat(value);
    return isNaN(parsedValue) ? value : parsedValue;
  }
  return value;
};
