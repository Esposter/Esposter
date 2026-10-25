// One key per row rather than a strip of them. Graphviz sizes the table with its own Helvetica metrics and the
// Reader's browser resolves that name to whatever it has, so any row holding two keys side by side is one font
// Substitution away from the first key's text running into the second key's swatch. A row that ends in text
// Cannot collide with anything.
export const getRow = (sample: string, text: string): string => `<TR>${sample}<TD ALIGN="LEFT">${text}</TD></TR>`;
