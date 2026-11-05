import { NotImplementedError } from "#src/models/shared/NotImplementedError";

// A selected document holds only the fields the query names, under the names the index stores them by. A nested path
// Is not modelled, so it is refused rather than returned whole
export const selectSearchDocumentFields = (
  document: Record<string, unknown>,
  select: readonly string[],
): Record<string, unknown> => {
  if (select.some((field) => field.includes("/"))) throw new NotImplementedError(selectSearchDocumentFields.name);
  return Object.fromEntries(select.filter((field) => field in document).map((field) => [field, document[field]]));
};
