// A reference page is loaded by the trigger-named index line in its own SKILL.md — nothing else reaches it, so
// A page no line names is a page no pass ever opens, however good it is. The line is an index entry, a list item
// Opening on the citation or a table row with a cell that is the citation alone: a citation inside a rule's prose
// Or a rule table's cell names the page without saying when to read it, which is the half of the index a reader
// Choosing what to load needs
export const checkIsIndexLine = (line: string, citation: string): boolean =>
  line.startsWith(`- ${citation} — `) ||
  (line.startsWith("|") && line.split("|").some((cell) => cell.trim() === citation));
