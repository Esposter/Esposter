// The names a README's Key Exports table lists: each identifier a code span in a row's first cell names, with a call's
// Parentheses after it, so a row naming several exports reads each of them. A span holding a path or a specifier names
// No export of a package's own. A section the README does not hold, or one with no table, lists none
export const readKeyExportNames = (markdown: string): string[] => {
  const lines = markdown.split("\n");
  const start = lines.findIndex((line) => line.includes('<a name="key-exports">'));
  if (start === -1) return [];

  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => line.startsWith("## "));
  const section = end === -1 ? rest : rest.slice(0, end);
  return section.flatMap((line) => {
    const cell = /^\|(?<cell>[^|]*)\|/u.exec(line)?.groups?.cell ?? "";
    return Array.from(cell.matchAll(/`(?<name>[A-Za-z_$][\w$]*)(?:\([^`]*\))?`/gu), ({ groups }) => groups?.name ?? "");
  });
};
