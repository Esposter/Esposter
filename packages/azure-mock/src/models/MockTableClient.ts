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
import type { Except } from "type-fest";
import type { MapValue } from "type-fest/source/entry";

import { MockRestError } from "@/models/MockRestError";
import { MockTableDatabase } from "@/store/MockTableDatabase";
import { applyTableFilter } from "@/util/tableFilter/applyTableFilter";
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

  get table(): MapValue<typeof MockTableDatabase> {
    let table = MockTableDatabase.get(this.tableName);
    if (!table) {
      table = new Map();
      MockTableDatabase.set(this.tableName, table);
    }
    return table;
  }

  constructor(_url: string, tableName: string) {
    this.tableName = tableName;
    this.url = `https://mockaccount.table.core.windows.net/${this.tableName}`;
  }

  createEntity<T extends object>(entity: TableEntity<T>): Promise<CreateTableEntityResponse> {
    const key = this.getCompositeKey(entity.partitionKey, entity.rowKey);
    if (this.table.has(key)) throw new MockRestError("The specified entity already exists.", 409);

    this.table.set(key, entity);
    return Promise.resolve({ date: new Date(), etag: this.getEtag() });
  }

  createTable(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  deleteEntity(partitionKey: string, rowKey: string): Promise<TableDeleteEntityHeaders> {
    const key = this.getCompositeKey(partitionKey, rowKey);
    if (!this.table.has(key)) throw new MockRestError("The specified resource does not exist.", 404);
    this.table.delete(key);
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
    const entity = this.table.get(key) as T | undefined;
    if (!entity) throw new MockRestError("The specified resource does not exist.", 404);
    return Promise.resolve({ ...entity, etag: this.getEtag() });
  }

  listEntities<T extends object>(
    options?: ListTableEntitiesOptions,
  ): PagedAsyncIterableIterator<TableEntityResult<T>, TableEntityResultPage<T>> {
    const withMetadata = this.withMetadata.bind(this);
    const filter = options?.queryOptions?.filter;
    const tableEntities = Array.from((this.table as Map<string, TableEntity<T>>).values());
    const resultTableEntities = filter ? applyTableFilter(tableEntities, filter) : tableEntities;
    return {
      byPage: () =>
        (async function* (entities: TableEntity<T>[]): AsyncGenerator<TableEntityResultPage<T>> {
          const allEntitiesWithMetadata = entities.map(withMetadata);
          if (allEntitiesWithMetadata.length > 0) yield await Promise.resolve(allEntitiesWithMetadata);
        })(resultTableEntities),
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

  submitTransaction(): Promise<TableTransactionResponse> {
    throw new Error("Method not implemented.");
  }

  updateEntity<T extends object>(entity: TableEntity<T>, mode: UpdateMode = "Merge"): Promise<TableMergeEntityHeaders> {
    const key = this.getCompositeKey(entity.partitionKey, entity.rowKey);
    const existingEntity = this.table.get(key);
    if (!existingEntity) throw new MockRestError("The specified resource does not exist.", 404);
    else if (mode === "Merge") return this.mergeEntity(key, existingEntity, entity);
    // "Replace"
    this.table.set(key, entity);
    return Promise.resolve({ date: new Date(), etag: this.getEtag() });
  }

  upsertEntity<T extends object>(entity: TableEntity<T>, mode: UpdateMode = "Merge"): Promise<TableMergeEntityHeaders> {
    const key = this.getCompositeKey(entity.partitionKey, entity.rowKey);
    const existingEntity = this.table.get(key);
    if (existingEntity && mode === "Merge") return this.mergeEntity(key, existingEntity, entity);
    // "Replace" or entity doesn't exist (which is an insert)
    this.table.set(key, entity);
    return Promise.resolve({ date: new Date(), etag: this.getEtag() });
  }

  private getCompositeKey(partitionKey: string, rowKey: string): string {
    return `${partitionKey}${ID_SEPARATOR}${rowKey}`;
  }

  private getEtag(): string {
    return `W/"datetime'${new Date().toISOString()}'"`;
  }

  private mergeEntity<T extends object>(
    key: string,
    entity: TableEntity<T>,
    entityToMerge: TableEntity<T>,
  ): Promise<TableMergeEntityHeaders> {
    this.table.set(key, { ...entity, ...entityToMerge });
    return Promise.resolve({ date: new Date(), etag: this.getEtag() });
  }

  private withMetadata<T extends object>(entity: T): T & { etag: string } {
    return {
      ...entity,
      etag: this.getEtag(),
    };
  }
}
