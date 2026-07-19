import type { PagedAsyncIterableIterator } from "@/models/PagedAsyncIterableIterator";
import type {
  CreateTableEntityResponse,
  GetAccessPolicyResponse,
  GetTableEntityResponse,
  ListTableEntitiesOptions,
  TableClient,
  TableDeleteEntityHeaders,
  TableEntity,
  TableEntityResult,
  TableEntityResultPage,
  TableMergeEntityHeaders,
  TableSetAccessPolicyHeaders,
  TableTransactionResponse,
  UpdateMode,
} from "@azure/data-tables";
import type { MapValue } from "@esposter/shared";
import type { Except } from "type-fest";

import { MOCK_TABLE_BASE_URL } from "@/constants";
import { MockRestError } from "@/models/MockRestError";
import { createFilterPredicate } from "@/services/filter/createFilterPredicate";
import { compareByCompositeKey } from "@/services/table/compareByCompositeKey";
import { MockTableDatabase } from "@/store/MockTableDatabase";
import { AZURE_MAX_PAGE_SIZE } from "@esposter/db-schema";
import { exhaustiveGuard, getOrCreate, getResult, ID_SEPARATOR, noop } from "@esposter/shared";
/**
 * An in-memory mock of the Azure TableClient.
 * It uses a Map to simulate table storage and correctly implements the TableClient interface.
 *
 * @example
 * const mockTableClient = new MockTableClient("", "hello world");
 * await mockTableClient.createEntity({ partitionKey: "partitionKey", rowKey: "rowKey" });
 * const entity = await mockTableClient.getEntity("partitionKey", "rowKey");
 */
export class MockTableClient<TEntity extends TableEntity = TableEntity> implements Except<TableClient, "pipeline"> {
  declare entityType: TEntity;
  tableName: string;
  url: string;

  get table(): MapValue<typeof MockTableDatabase> {
    return getOrCreate(MockTableDatabase, this.tableName, () => new Map());
  }

  constructor(_url: string, tableName: string) {
    this.tableName = tableName;
    this.url = `${MOCK_TABLE_BASE_URL}/${this.tableName}`;
  }

  createEntity<T extends object>(entity: TableEntity<T>): Promise<CreateTableEntityResponse> {
    this.#applyCreate(entity);
    return Promise.resolve({ date: new Date(), etag: this.#getEtag() });
  }

  createTable(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  deleteEntity(partitionKey: string, rowKey: string): Promise<TableDeleteEntityHeaders> {
    this.#applyDelete(partitionKey, rowKey);
    // The real response contains headers, an empty object is a sufficient mock.
    return Promise.resolve({});
  }

  deleteTable(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  getAccessPolicy(): Promise<GetAccessPolicyResponse> {
    throw new Error("Method not implemented.");
  }

  getEntity<T extends object = Record<string, unknown>>(
    partitionKey: string,
    rowKey: string,
  ): Promise<GetTableEntityResponse<TableEntityResult<T>>> {
    const key = this.#getCompositeKey(partitionKey, rowKey);
    const entity = this.table.get(key) as (T & { etag?: string }) | undefined;
    if (!entity) throw new MockRestError("The specified resource does not exist.", 404);
    // The stored etag is served so a subsequent conditional update can match against the version read
    return Promise.resolve({ ...entity, etag: entity.etag ?? this.#getEtag() });
  }

  listEntities<T extends object>(
    options?: ListTableEntitiesOptions,
  ): PagedAsyncIterableIterator<TableEntityResult<T>, TableEntityResultPage<T>> {
    const withMetadata = this.#withMetadata.bind(this);
    const filter = options?.queryOptions?.filter;
    // Azure Table Storage returns entities ordered by partitionKey then rowKey, not insertion order —
    // The reverse-ticked message rowKey design relies on that scan order to read newest-first.
    const tableEntities = [...(this.table as Map<string, TableEntity<T>>).values()].sort(compareByCompositeKey);
    const predicate = filter ? createFilterPredicate(filter) : undefined;
    const resultTableEntities = predicate ? tableEntities.filter((e) => predicate(e)) : tableEntities;
    return {
      byPage: ({ maxPageSize } = {}) =>
        (async function* (entities: TableEntity<T>[]): AsyncGenerator<TableEntityResultPage<T>> {
          if (maxPageSize !== undefined && maxPageSize <= 0)
            throw new RangeError("maxPageSize must be greater than 0.");
          // Azure Table Storage rejects a page size above its hard limit with InvalidInput (400)
          else if (maxPageSize !== undefined && maxPageSize > AZURE_MAX_PAGE_SIZE)
            throw new MockRestError("One of the request inputs is not valid.", 400);

          const allEntitiesWithMetadata = entities.map((e) => withMetadata(e));
          if (allEntitiesWithMetadata.length === 0) return;
          else if (!maxPageSize) {
            yield await Promise.resolve(allEntitiesWithMetadata);
            return;
          }
          for (let i = 0; i < allEntitiesWithMetadata.length; i += maxPageSize)
            yield await Promise.resolve(allEntitiesWithMetadata.slice(i, i + maxPageSize));
        })(resultTableEntities),
      // Each next() call builds a fresh generator and returns its first element, so a bare
      // For await over listEntities loops forever on the first entity — always paginate via byPage().
      next: () =>
        (async function* (entities: TableEntity<T>[]): AsyncGenerator<TableEntityResult<T>> {
          for (const entity of entities) yield await Promise.resolve(withMetadata(entity));
        })(resultTableEntities).next(),
      [Symbol.asyncIterator]() {
        return this;
      },
    };
  }

  setAccessPolicy(): Promise<TableSetAccessPolicyHeaders> {
    throw new Error("Method not implemented.");
  }

  // The service applies a transaction atomically, so the actions land through the synchronous appliers rather
  // Than the promise-returning methods: awaiting between two actions would let a concurrent caller interleave
  // Its own writes, and the rollback below would then restore a snapshot predating them — silently dropping
  // Writes the service would have kept. Nothing may observe a half-applied batch, including a losing one.
  submitTransaction(actions: Parameters<TableClient["submitTransaction"]>[0]): Promise<TableTransactionResponse> {
    let partitionKey: string | undefined;
    for (const [, entity] of actions)
      if (partitionKey === undefined) partitionKey = entity.partitionKey;
      else if (entity.partitionKey !== partitionKey)
        throw new MockRestError("All transaction actions must target the same partitionKey.", 400);

    const snapshot = new Map(this.table);
    getResult(() => {
      for (const [type, entity, updateMode] of actions)
        switch (type) {
          case "create":
            this.#applyCreate(entity);
            break;
          case "delete":
            this.#applyDelete(entity.partitionKey, entity.rowKey);
            break;
          case "update":
            this.#applyUpdate(entity, updateMode);
            break;
          case "upsert":
            this.#applyUpsert(entity, updateMode);
            break;
          default:
            exhaustiveGuard(type);
        }
    })
      .orTee(() => {
        this.table.clear();
        for (const [key, value] of snapshot) this.table.set(key, value);
      })
      .match(noop, (error) => {
        throw error;
      });
    // A transaction the service accepted reports 202 with no sub-response body, so an entity lookup finds
    // Nothing to return — the shape is the real one, not a cast past it
    return Promise.resolve({
      getResponseForEntity: () => undefined,
      status: 202,
      subResponses: [],
    });
  }

  updateEntity<T extends object>(
    entity: TableEntity<T>,
    mode: UpdateMode = "Merge",
    options?: { etag?: string },
  ): Promise<TableMergeEntityHeaders> {
    this.#applyUpdate(entity, mode, options?.etag);
    return Promise.resolve({ date: new Date(), etag: this.#getEtag() });
  }

  upsertEntity<T extends object>(entity: TableEntity<T>, mode: UpdateMode = "Merge"): Promise<TableMergeEntityHeaders> {
    this.#applyUpsert(entity, mode);
    return Promise.resolve({ date: new Date(), etag: this.#getEtag() });
  }

  #applyCreate<T extends object>(entity: TableEntity<T>): void {
    const key = this.#getCompositeKey(entity.partitionKey, entity.rowKey);
    if (this.table.has(key)) throw new MockRestError("The specified entity already exists.", 409);
    this.table.set(key, { ...entity, etag: this.#getEtag() });
  }

  #applyDelete(partitionKey: string, rowKey: string): void {
    const key = this.#getCompositeKey(partitionKey, rowKey);
    if (!this.table.has(key)) throw new MockRestError("The specified resource does not exist.", 404);
    this.table.delete(key);
  }

  #applyUpdate<T extends object>(entity: TableEntity<T>, mode: UpdateMode = "Merge", etag?: string): void {
    const key = this.#getCompositeKey(entity.partitionKey, entity.rowKey);
    const existingEntity = this.table.get(key);
    if (!existingEntity) throw new MockRestError("The specified resource does not exist.", 404);
    // A conditional update only lands when the caller saw the current version — the real service's
    // Optimistic-concurrency contract ("*" is the wildcard that always matches)
    else if (etag !== undefined && etag !== "*" && etag !== existingEntity.etag)
      throw new MockRestError("The update condition specified in the request was not satisfied.", 412);
    else if (mode === "Merge") this.table.set(key, { ...existingEntity, ...entity, etag: this.#getEtag() });
    // "Replace"
    else this.table.set(key, { ...entity, etag: this.#getEtag() });
  }

  #applyUpsert<T extends object>(entity: TableEntity<T>, mode: UpdateMode = "Merge"): void {
    const key = this.#getCompositeKey(entity.partitionKey, entity.rowKey);
    const existingEntity = this.table.get(key);
    if (existingEntity && mode === "Merge")
      this.table.set(key, { ...existingEntity, ...entity, etag: this.#getEtag() });
    // "Replace" or entity doesn't exist (which is an insert)
    else this.table.set(key, { ...entity, etag: this.#getEtag() });
  }

  #getCompositeKey(partitionKey: string, rowKey: string): string {
    return `${partitionKey}${ID_SEPARATOR}${rowKey}`;
  }

  // Random rather than timestamped: two writes can land within one clock tick, and equal etags across
  // Versions would make a stale conditional update falsely match
  #getEtag(): string {
    return `W/"${crypto.randomUUID()}"`;
  }

  #withMetadata<T extends object>(entity: T & { etag?: string }): T & { etag: string } {
    return {
      ...entity,
      etag: entity.etag ?? this.#getEtag(),
    };
  }
}
