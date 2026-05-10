const NUMBER_REGEX = new RegExp(String.raw`^[+-]?\d+(\.\d+)?$`, "u");

export const parseXmlValue = (value: string): boolean | number | string => {
  if (value === "true") return true;
  else if (value === "false") return false;
  else if (NUMBER_REGEX.test(value)) {
    const parsedValue = parseFloat(value);
    return isNaN(parsedValue) ? value : parsedValue;
  } else return value;
};
