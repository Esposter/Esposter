import type { PagedAsyncIterableIterator } from "@/models/PagedAsyncIterableIterator";
import type {
  CreateTableEntityResponse,
  GetAccessPolicyResponse,
  GetTableEntityResponse,
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
import type { Except } from "type-fest";

import { MockRestError } from "@/models/MockRestError";
import { MockTableDatabase } from "@/store/MockTableDatabase";
import { ID_SEPARATOR } from "@esposter/shared";
/**
 * An in-memory mock of the Azure TableClient.
 * It uses a Map to simulate table storage and correctly implements the TableClient interface.
 *
 * @example
 * const mockTableClient = new MockTableClient("", "hello world");
 * await mockTableClient.createEntity({ partitionKey: "partitionKey", rowKey: "rowKey" });
 * const entity = await mockTableClient.getEntity("partitionKey", "rowKey");
 */
export class MockTableClient implements Except<TableClient, "pipeline"> {
  tableName: string;
  url: string;

  constructor(_url: string, tableName: string) {
    this.tableName = tableName;
    this.url = `https://mockaccount.table.core.windows.net/${this.tableName}`;
    if (!(tableName in MockTableDatabase)) MockTableDatabase[tableName] = new Map<string, TableEntity>();
  }

  createEntity<T extends object>(entity: TableEntity<T>): Promise<CreateTableEntityResponse> {
    const key = this.getCompositeKey(entity.partitionKey, entity.rowKey);
    if (MockTableDatabase[this.tableName].has(key))
      throw new MockRestError("The specified entity already exists.", 409);

    const storedEntity = this.withMetadata(entity);
    MockTableDatabase[this.tableName].set(key, storedEntity);
    return Promise.resolve({ date: new Date(), etag: storedEntity.etag });
  }

  createTable(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  deleteEntity(partitionKey: string, rowKey: string): Promise<TableDeleteEntityHeaders> {
    const key = this.getCompositeKey(partitionKey, rowKey);
    if (!MockTableDatabase[this.tableName].has(key))
      throw new MockRestError("The specified resource does not exist.", 404);
    MockTableDatabase[this.tableName].delete(key);
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
    const key = this.getCompositeKey(partitionKey, rowKey);
    const entity = MockTableDatabase[this.tableName].get(key);
    if (!entity) throw new MockRestError("The specified resource does not exist.", 404);

    const entityWithMetadata = this.withMetadata(entity as T);
    return Promise.resolve(entityWithMetadata);
  }

  listEntities<T extends object>(): PagedAsyncIterableIterator<TableEntityResult<T>, TableEntityResultPage<T>> {
    const withMetadata = this.withMetadata.bind(this);
    return {
      byPage: () =>
        (async function* (entities: Map<string, T>): AsyncGenerator<TableEntityResultPage<T>> {
          // For a simple mock, we'll return all entities in a single page
          // A more complex mock could implement maxPageSize and continuationTokens
          const allEntitiesWithMetadata = [...entities.values()].map(withMetadata);
          if (allEntitiesWithMetadata.length > 0) yield await Promise.resolve(allEntitiesWithMetadata);
        })(MockTableDatabase[this.tableName] as Map<string, T>),
      next: () =>
        (async function* (entities: Map<string, T>): AsyncGenerator<TableEntityResult<T>> {
          for (const entity of entities.values()) {
            const entityWithMetadata = withMetadata(entity);
            yield await Promise.resolve(entityWithMetadata);
          }
        })(MockTableDatabase[this.tableName] as Map<string, T>).next(),
      [Symbol.asyncIterator]() {
        return this;
      },
    };
  }

  setAccessPolicy(): Promise<TableSetAccessPolicyHeaders> {
    throw new Error("Method not implemented.");
  }

  submitTransaction(): Promise<TableTransactionResponse> {
    throw new Error("Method not implemented.");
  }

  updateEntity<T extends object>(entity: TableEntity<T>, mode: UpdateMode = "Merge"): Promise<TableMergeEntityHeaders> {
    const key = this.getCompositeKey(entity.partitionKey, entity.rowKey);
    const existingEntity = MockTableDatabase[this.tableName].get(key);
    if (!existingEntity) throw new MockRestError("The specified resource does not exist.", 404);
    else if (mode === "Merge") return this.mergeEntity(key, existingEntity, entity);
    // "Replace"
    const newEntityWithMetadata = this.withMetadata(entity);
    MockTableDatabase[this.tableName].set(key, newEntityWithMetadata);
    return Promise.resolve({ date: new Date(), etag: newEntityWithMetadata.etag });
  }

  upsertEntity<T extends object>(entity: TableEntity<T>, mode: UpdateMode = "Merge"): Promise<TableMergeEntityHeaders> {
    const key = this.getCompositeKey(entity.partitionKey, entity.rowKey);
    const existingEntity = MockTableDatabase[this.tableName].get(key);
    if (existingEntity && mode === "Merge") return this.mergeEntity(key, existingEntity, entity);
    // "Replace" or entity doesn't exist (which is an insert)
    const newEntity = this.withMetadata(entity);
    MockTableDatabase[this.tableName].set(key, newEntity);
    return Promise.resolve({ date: new Date(), etag: newEntity.etag });
  }

  private getCompositeKey(partitionKey: string, rowKey: string): string {
    return `${partitionKey}${ID_SEPARATOR}${rowKey}`;
  }

  private mergeEntity<T extends object>(
    key: string,
    entity: TableEntity<T>,
    entityToMerge: TableEntity<T>,
  ): Promise<TableMergeEntityHeaders> {
    const mergedEntityWithMetadata = this.withMetadata({ ...entity, ...entityToMerge });
    MockTableDatabase[this.tableName].set(key, mergedEntityWithMetadata);
    return Promise.resolve({ date: new Date(), etag: mergedEntityWithMetadata.etag });
  }
  // Helper to add mock metadata, similar to the real SDK
  private withMetadata<T extends object>(entity: T): T & { etag: string } {
    return {
      ...entity,
      etag: `W/"datetime'${new Date().toISOString()}'"`,
    };
  }
}
