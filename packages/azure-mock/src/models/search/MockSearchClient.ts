import type { MapValue } from "#src/util/types/MapValue";
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
import type { Except } from "type-fest";

import { NotImplementedError } from "#src/models/shared/NotImplementedError";
import { MOCK_SEARCH_BASE_URL } from "#src/services/constants";
import { createFilterPredicate } from "#src/services/filter/createFilterPredicate";
import { searchDocuments } from "#src/services/search/searchDocuments";
import { sortDocuments } from "#src/services/search/sortDocuments";
import { MockSearchDatabase } from "#src/store/MockSearchDatabase";
import { getOrCreate } from "@esposter/shared";

/**
 * An in-memory mock of the Azure SearchClient — no emulator and no network. It applies the same OData filtering
 * as the other mock clients, so a query behaves the same here as it does against the service.
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
    return getOrCreate(MockSearchDatabase, this.indexName, () => []);
  }

  constructor(indexName: string) {
    this.indexName = indexName;
  }

  autocomplete(): Promise<AutocompleteResult> {
    throw new NotImplementedError(this.autocomplete.name);
  }

  deleteDocuments(documents: TModel[], options?: DeleteDocumentsOptions): Promise<IndexDocumentsResult>;
  deleteDocuments(
    keyName: keyof TModel,
    keyValues: string[],
    options?: DeleteDocumentsOptions,
  ): Promise<IndexDocumentsResult>;
  deleteDocuments(): Promise<IndexDocumentsResult> {
    throw new NotImplementedError(this.deleteDocuments.name);
  }

  getDocument<TFields extends SelectFields<TModel>>(
    _key: string,
    _options?: GetDocumentOptions<TModel, TFields>,
  ): Promise<NarrowedModel<TModel, TFields>> {
    throw new NotImplementedError(this.getDocument.name);
  }

  getDocumentsCount(_options?: CountDocumentsOptions): Promise<number> {
    return Promise.resolve(this.documents.length);
  }

  indexDocuments(_batch: IndexDocumentsBatch<TModel>, _options?: IndexDocumentsOptions): Promise<IndexDocumentsResult> {
    throw new NotImplementedError(this.indexDocuments.name);
  }

  mergeDocuments(_documents: TModel[], _options?: MergeDocumentsOptions): Promise<IndexDocumentsResult> {
    throw new NotImplementedError(this.mergeDocuments.name);
  }

  mergeOrUploadDocuments(
    _documents: TModel[],
    _options?: MergeOrUploadDocumentsOptions,
  ): Promise<IndexDocumentsResult> {
    throw new NotImplementedError(this.mergeOrUploadDocuments.name);
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
    // eslint-disable-next-line no-restricted-syntax -- A fake against an SDK result type with private members
    return Promise.resolve({ ...(includeTotalCount ? { count } : {}), results } as unknown as SearchDocumentsResult<
      TModel,
      TFields
    >);
  }

  suggest<TFields extends SelectFields<TModel> = never>(
    _searchText: string,
    _suggesterName: string,
    _options?: SuggestOptions<TModel, TFields>,
  ): Promise<SuggestDocumentsResult<TModel, TFields>> {
    throw new NotImplementedError(this.suggest.name);
  }

  uploadDocuments(documents: TModel[], _options?: UploadDocumentsOptions): Promise<IndexDocumentsResult> {
    this.documents.push(...documents);
    return Promise.resolve({ results: [] });
  }
}
