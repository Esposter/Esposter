const IDENTIFIER_REGEX = /^[A-Za-z_$][\w$]*$/u;

// `__proto__` is a computed key: as a bare or quoted object-literal key it sets the prototype instead of naming a property
export const renderName = (name: string): string => {
  if (name === "__proto__") return `["__proto__"]`;
  return IDENTIFIER_REGEX.test(name) ? name : JSON.stringify(name);
};
