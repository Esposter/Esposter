// A JSON null and an absent property both become an empty cell, which coerces back to null the way
// The CSV path already does. String() alone would persist them as the text "null" and "undefined",
// And a container as "[object Object]" - each branch narrows so only a real primitive is stringified.
export const getCellText = (value: unknown) => {
  if (value === null || value === undefined) return "";
  else if (typeof value === "string") return value;
  else if (typeof value === "boolean" || typeof value === "number") return String(value);
  else return JSON.stringify(value);
};
