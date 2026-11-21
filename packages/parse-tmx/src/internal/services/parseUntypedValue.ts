const NUMBER_REGEX = /^[+-]?\d+(?:\.\d+)?$/u;

// The value of an attribute that carries no type of its own, such as a text object's styling: a number where the text
// Reads as one, a boolean where it reads as one, and a string otherwise
export const parseUntypedValue = (value: string): boolean | number | string => {
  if (value === "true") return true;
  else if (value === "false") return false;
  else if (NUMBER_REGEX.test(value)) return Number(value);
  else return value;
};
