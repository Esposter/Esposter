// OData delimits a string literal with single quotes, so an embedded quote is doubled — undoubled, a value
// Could close the literal and append filter syntax of its own. Callers validate their own inputs too, but a
// Filter has to be safe to build from any string on its own, or the next caller inherits an injection
export const escapeValue = (value: string) => `'${value.replaceAll("'", "''")}'`;
