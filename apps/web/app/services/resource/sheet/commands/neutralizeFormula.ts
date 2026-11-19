// A cell a spreadsheet reads as a formula is prefixed with an apostrophe, the OWASP CSV-injection mitigation, so a paste
// Into one shows the text instead of running it. A tab or a line break opens a cell of its own in TSV, so it counts too
const FORMULA_START_REGEX = /^[\t\r\n=+\-@]/u;

export const neutralizeFormula = (value: string) => (FORMULA_START_REGEX.test(value) ? `'${value}` : value);
