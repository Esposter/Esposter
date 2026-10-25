export const getLine = (color: string, widths: number[]): string =>
  [
    '<TD><TABLE BORDER="0" CELLBORDER="0" CELLSPACING="3" CELLPADDING="0"><TR>',
    ...widths.map((width) => `<TD BGCOLOR="${color}" HEIGHT="4" WIDTH="${width}"></TD>`),
    "</TR></TABLE></TD>",
  ].join("");
