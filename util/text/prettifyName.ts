// Puts space between capital and non-capital letters for variable names
export const prettifyName = (string: string) => string.replaceAll(/([A-Z])/g, " $1").trim();
