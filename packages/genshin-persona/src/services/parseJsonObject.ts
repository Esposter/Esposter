// A plugin a stranger installs carries no `@esposter/shared` and neither text read here holds a date, so `JSON.parse`
// Stands in for `jsonDateParse`. Every root but an object is dropped, because the settings file is the person's to
// Hand-edit and `null` parses fine and then throws on the first key its reader reaches for. Text that is not JSON at
// All still throws: a reader that swallowed it would answer with an empty object, and the writer behind it would
// Overwrite the settings it had failed to read
export const parseJsonObject = (text: string): Record<string, unknown> => {
  // oxlint-disable-next-line no-restricted-properties -- this JSON holds no dates, so the reviver has nothing to revive
  const json: unknown = JSON.parse(text);
  return typeof json === "object" && json !== null && !Array.isArray(json) ? (json as Record<string, unknown>) : {};
};
