import type {
  AutocompleteResult,
  CountDocumentsOptions,
  DeleteDocumentsOptions,
  GetDocumentOptions,
  IndexDocumentsBatch,
  IndexDocumentsOptions,
  IndexDocumentsResult,
  MergeDocumentsOptions,
  MergeOrUploadDocumentsOptions,
  NarrowedModel,
  SearchClient,
  SearchDocumentsResult,
  SearchOptions,
  SelectFields,
  SuggestDocumentsResult,
  SuggestOptions,
  UploadDocumentsOptions,
} from "@azure/search-documents";
import type { MapValue } from "@esposter/shared";
import type { Except } from "type-fest";

import { MOCK_SEARCH_BASE_URL } from "@/constants";
import { createFilterPredicate } from "@/services/filter/createFilterPredicate";
import { MockSearchDatabase } from "@/store/MockSearchDatabase";
import { deserializeKey } from "@esposter/db";

const toComparable = (value: unknown): number | string => {
  if (value instanceof Date) return value.getTime();
  else if (typeof value === "number" || typeof value === "string") return value;
  else return String(value);
};

const compareValues = (leftHandSide: unknown, rightHandSide: unknown): number => {
  const left = toComparable(leftHandSide);
  const right = toComparable(rightHandSide);
  if (typeof left === "number" && typeof right === "number") return left - right;
  return String(left).localeCompare(String(right));
};

const sortDocuments = (documents: Record<string, unknown>[], orderBy: string[]): Record<string, unknown>[] =>
  [...documents].toSorted((leftHandSide, rightHandSide) => {
    for (const clause of orderBy) {
      const [field = "", direction = "asc"] = clause.split(/\s+/u);
      const key = deserializeKey(field);
      const comparison = compareValues(leftHandSide[key], rightHandSide[key]);
      if (comparison !== 0) return direction === "desc" ? -comparison : comparison;
    }
    return 0;
  });

const getSearchFieldValues = (value: unknown, pathSegments: string[]): unknown[] => {
  if (pathSegments.length === 0) return [value];
  if (Array.isArray(value)) return value.flatMap((item) => getSearchFieldValues(item, pathSegments));
  if (typeof value !== "object" || value === null) return [];

  const [field = "", ...remainingPathSegments] = pathSegments;
  return getSearchFieldValues((value as Record<string, unknown>)[deserializeKey(field)], remainingPathSegments);
};

const searchDocuments = (
  documents: Record<string, unknown>[],
  searchText: string | undefined,
  searchFields: readonly string[] | undefined,
): Record<string, unknown>[] => {
  if (!searchText || searchText === "*") return documents;

  const normalizedSearchText = searchText.toLocaleLowerCase();
  return documents.filter((document) =>
    (searchFields ?? Object.keys(document)).some((searchField) =>
      getSearchFieldValues(document, searchField.split("/")).some(
        (value) =>
          value !== null && value !== undefined && String(value).toLocaleLowerCase().includes(normalizedSearchText),
      ),
    ),
  );
};

/**
 * An in-memory mock of the Azure SearchClient.
 * It uses a Map to simulate the search index and applies the same OData filtering as the other mock clients.
 *
 * @example
 * const mockSearchClient = new MockSearchClient(SearchIndex.Messages);
 * await mockSearchClient.uploadDocuments([{ ... }]);
 * const { count, results } = await mockSearchClient.search("*", { filter, includeTotalCount: true });
 */
export class MockSearchClient<TModel extends object = Record<string, unknown>> implements Except<
  SearchClient<TModel>,
  "pipeline"
> {
  readonly apiVersion: string = "";
  readonly endpoint: string = MOCK_SEARCH_BASE_URL;
  readonly indexName: string;
  readonly serviceVersion: string = "";

  get documents(): MapValue<typeof MockSearchDatabase> {
    let documents = MockSearchDatabase.get(this.indexName);
    if (!documents) {
      documents = [];
      MockSearchDatabase.set(this.indexName, documents);
    }
    return documents;
  }

  constructor(indexName: string) {
    this.indexName = indexName;
  }

  autocomplete(): Promise<AutocompleteResult> {
    throw new Error("Method not implemented.");
  }

  deleteDocuments(documents: TModel[], options?: DeleteDocumentsOptions): Promise<IndexDocumentsResult>;
  deleteDocuments(
    keyName: keyof TModel,
    keyValues: string[],
    options?: DeleteDocumentsOptions,
  ): Promise<IndexDocumentsResult>;
  deleteDocuments(): Promise<IndexDocumentsResult> {
    throw new Error("Method not implemented.");
  }

  getDocument<TFields extends SelectFields<TModel>>(
    _key: string,
    _options?: GetDocumentOptions<TModel, TFields>,
  ): Promise<NarrowedModel<TModel, TFields>> {
    throw new Error("Method not implemented.");
  }

  getDocumentsCount(_options?: CountDocumentsOptions): Promise<number> {
    return Promise.resolve(this.documents.length);
  }

  indexDocuments(_batch: IndexDocumentsBatch<TModel>, _options?: IndexDocumentsOptions): Promise<IndexDocumentsResult> {
    throw new Error("Method not implemented.");
  }

  mergeDocuments(_documents: TModel[], _options?: MergeDocumentsOptions): Promise<IndexDocumentsResult> {
    throw new Error("Method not implemented.");
  }

  mergeOrUploadDocuments(
    _documents: TModel[],
    _options?: MergeOrUploadDocumentsOptions,
  ): Promise<IndexDocumentsResult> {
    throw new Error("Method not implemented.");
  }

  search<TFields extends SelectFields<TModel>>(
    searchText?: string,
    options?: SearchOptions<TModel, TFields>,
  ): Promise<SearchDocumentsResult<TModel, TFields>> {
    const { filter, includeTotalCount, orderBy, searchFields, skip = 0, top } = options ?? {};
    let documents = searchDocuments(this.documents as Record<string, unknown>[], searchText, searchFields);
    if (filter) {
      const predicate = createFilterPredicate(filter);
      documents = documents.filter((document) => predicate(document));
    }
    if (orderBy) documents = sortDocuments(documents, orderBy);
    const count = documents.length;
    const paginatedDocuments = documents.slice(skip, top === undefined ? undefined : skip + top);
    const results = {
      // oxlint-disable-next-line typescript/require-await -- async required by the AsyncIterator protocol
      async *[Symbol.asyncIterator](): AsyncGenerator<{ document: TModel }> {
        for (const document of paginatedDocuments) yield { document: document as TModel };
      },
    };
    return Promise.resolve({
      ...(includeTotalCount ? { count } : {}),
      results,
    } as unknown as SearchDocumentsResult<TModel, TFields>);
  }

  suggest<TFields extends SelectFields<TModel> = never>(
    _searchText: string,
    _suggesterName: string,
    _options?: SuggestOptions<TModel, TFields>,
  ): Promise<SuggestDocumentsResult<TModel, TFields>> {
    throw new Error("Method not implemented.");
  }

  uploadDocuments(documents: TModel[], _options?: UploadDocumentsOptions): Promise<IndexDocumentsResult> {
    this.documents.push(...documents);
    return Promise.resolve({ results: [] } as unknown as IndexDocumentsResult);
  }
}
