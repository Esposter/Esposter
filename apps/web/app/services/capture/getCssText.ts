export const getCssText = (style: CSSStyleDeclaration) =>
  Array.from(style, (property) => `${property}:${style.getPropertyValue(property)}`).join(";");
