import { getSearchFieldValues } from "#src/services/search/getSearchFieldValues";

export const searchDocuments = (
  documents: Record<string, unknown>[],
  searchText: string | undefined,
  searchFields: readonly string[] | undefined,
): Record<string, unknown>[] => {
  if (!searchText || searchText === "*") return documents;

  const normalizedSearchText = searchText.toLocaleLowerCase();
  const searchFieldPaths = searchFields?.map((searchField) => searchField.split("/"));
  return documents.filter((document) =>
    (searchFieldPaths ?? Object.keys(document).map((field) => field.split("/"))).some((pathSegments) =>
      // Only string leaves match a search: every other field type is filterable rather than searchable in Azure Search
      getSearchFieldValues(document, pathSegments).some(
        (value) => typeof value === "string" && value.toLocaleLowerCase().includes(normalizedSearchText),
      ),
    ),
  );
};
