import type { Clause, CompositeKey, StreamTable } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";
import type { DrizzleD1Database } from "drizzle-orm/d1";

import type { SerializedEntity } from "#src/models/streams/SerializedEntity";
import type { StreamListOptions } from "#src/models/streams/StreamListOptions";
import type { StreamTableAction } from "#src/models/streams/StreamTableAction";
import { StreamTableError } from "#src/models/streams/StreamTableError";
import type { StreamTableSchema } from "#src/models/streams/StreamTableSchema";
import type { UpdateMode } from "#src/models/streams/UpdateMode";

import { createStreamTable } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";
import { and, asc, count, desc, eq, sql } from "drizzle-orm";
import { translateWriteError } from "#src/services/streams/error/translateWriteError";
import { compileClauses } from "#src/services/streams/compileClauses";
import { readStreamRow } from "#src/services/streams/readStreamRow";
import { v7 } from "uuid";

type ClauseList = Clause<Record<string, unknown>>[];
type StreamRowEntity = SerializedEntity & { etag: string };

// The table client over one D1 table. It answers the reads and writes the code makes: a row by its keys, a list
// narrowed by clauses, a count, the writes of one row and a batch of writes that applies all or none. A missing row is
// null on a read, and a write that cannot apply raises a StreamTableError naming why
export class StreamTableClient<TEntity extends CompositeKey> {
  // The entity type rides on the client as a phantom, since one table holds one entity type
  declare readonly entityType: TEntity;
  private readonly database: DrizzleD1Database;
  private readonly table: StreamTableSchema;

  constructor(database: DrizzleD1Database, tableName: StreamTable) {
    this.database = database;
    this.table = createStreamTable(tableName);
  }

  async count(clauses: ClauseList = []): Promise<number> {
    const [row] = await this.database
      .select({ count: count() })
      .from(this.table)
      .where(compileClauses(clauses, this.table));
    return row?.count ?? 0;
  }

  async createEntity(entity: SerializedEntity): Promise<{ etag: string }> {
    const etag = v7();
    await this.run(this.database.insert(this.table).values(this.getRow(entity, etag)));
    return { etag };
  }

  async deleteEntity(partitionKey: string, rowKey: string, options?: { etag?: string }): Promise<void> {
    const deletedRows = await this.run(
      this.database
        .delete(this.table)
        .where(this.getKeyCondition(partitionKey, rowKey, options?.etag))
        .returning({ rowKey: this.table.rowKey }),
    );
    if (deletedRows.length === 0) throw new StreamTableError(options?.etag === undefined ? "notFound" : "etagMismatch");
  }

  async getEntity(partitionKey: string, rowKey: string): Promise<StreamRowEntity | null> {
    const [row] = await this.database
      .select()
      .from(this.table)
      .where(this.getKeyCondition(partitionKey, rowKey))
      .limit(1);
    return row ? readStreamRow(row) : null;
  }

  async list(clauses: ClauseList = [], options: StreamListOptions = {}): Promise<StreamRowEntity[]> {
    const rows = await this.database
      .select()
      .from(this.table)
      .where(compileClauses(clauses, this.table))
      .orderBy(
        asc(this.table.partitionKey),
        options.orderBy === "desc" ? desc(this.table.rowKey) : asc(this.table.rowKey),
      )
      // SQLite reads a negative limit as no limit at all
      .limit(options.limit ?? -1);
    return rows.map((row) => readStreamRow(row));
  }

  // Applies every action in one batch: all of them land, or none does, and that includes an update whose etag is stale
  async submitTransaction(actions: StreamTableAction[]): Promise<void> {
    const [firstStatement, ...restStatements] = actions.flatMap((action) => this.getStatements(action));
    if (firstStatement) await this.run(this.database.batch([firstStatement, ...restStatements]));
  }

  async updateEntity(
    entity: SerializedEntity,
    mode: UpdateMode,
    options?: { etag?: string },
  ): Promise<{ etag: string }> {
    const etag = v7();
    const updatedRows = await this.run(
      this.database
        .update(this.table)
        .set(this.getUpdateValues(entity, mode, etag))
        .where(this.getKeyCondition(entity.partitionKey, entity.rowKey, options?.etag))
        .returning({ rowKey: this.table.rowKey }),
    );
    if (updatedRows.length === 0) throw new StreamTableError(options?.etag === undefined ? "notFound" : "etagMismatch");
    return { etag };
  }

  async upsertEntity(entity: SerializedEntity, mode: UpdateMode): Promise<{ etag: string }> {
    const etag = v7();
    await this.run(
      this.database
        .insert(this.table)
        .values(this.getRow(entity, etag))
        .onConflictDoUpdate({
          set: {
            entity: mode === "Merge" ? sql`json_patch(${this.table.entity}, excluded.entity)` : sql`excluded.entity`,
            etag: sql`excluded.etag`,
          },
          target: [this.table.partitionKey, this.table.rowKey],
        }),
    );
    return { etag };
  }

  // Adds one to a numeric property of a row, creating the row at one when it is missing. It is one statement, so two
  // concurrent increments both land, which a read, add and write of the row cannot promise
  async increment(partitionKey: string, rowKey: string, property: string): Promise<void> {
    const path = `$.${property}`;
    await this.run(
      this.database
        .insert(this.table)
        .values(this.getRow({ [property]: 1, partitionKey, rowKey }, v7()))
        .onConflictDoUpdate({
          set: {
            entity: sql`json_set(${this.table.entity}, ${path}, json_extract(${this.table.entity}, ${path}) + 1)`,
            etag: sql`excluded.etag`,
          },
          target: [this.table.partitionKey, this.table.rowKey],
        }),
    );
  }

  // Awaits a D1 statement and names a refused write as a StreamTableError, so a caller branches on a code
  private run<T>(query: PromiseLike<T>): Promise<T> {
    return getResultAsync(async () => query).match(
      (value) => value,
      (error) => {
        throw translateWriteError(error);
      },
    );
  }

  private getStatements(action: StreamTableAction): BatchItem<"sqlite">[] {
    switch (action[0]) {
      case "create":
        return [this.database.insert(this.table).values(this.getRow(action[1], v7()))];
      case "delete":
        return [this.database.delete(this.table).where(this.getKeyCondition(action[1].partitionKey, action[1].rowKey))];
      case "update":
        return this.getUpdateStatements(action[1], action[2], action[3]?.etag);
    }
  }

  // A batch cannot report which of its statements matched a row, and it must apply none of its writes when one of them
  // is stale. So a conditional update is preceded by a guard that inserts the row again, with a null entity, only when
  // its etag is not the one named. The null fails the whole batch before any of its writes lands
  private getUpdateStatements(
    entity: SerializedEntity,
    mode: UpdateMode,
    etag: string | undefined,
  ): BatchItem<"sqlite">[] {
    const update = this.database
      .update(this.table)
      .set(this.getUpdateValues(entity, mode, v7()))
      .where(this.getKeyCondition(entity.partitionKey, entity.rowKey));
    if (etag === undefined) return [update];
    const guard = this.database.run(
      sql`insert into ${this.table} (partitionKey, rowKey, etag, entity) select partitionKey, rowKey, etag, null from ${this.table} where partitionKey = ${entity.partitionKey} and rowKey = ${entity.rowKey} and etag <> ${etag}`,
    );
    return [guard, update];
  }

  private getKeyCondition(partitionKey: string, rowKey: string, etag?: string): SQL | undefined {
    return and(
      eq(this.table.partitionKey, partitionKey),
      eq(this.table.rowKey, rowKey),
      etag === undefined ? undefined : eq(this.table.etag, etag),
    );
  }

  private getRow(entity: SerializedEntity, etag: string) {
    return { entity: getStoredProperties(entity), etag, partitionKey: entity.partitionKey, rowKey: entity.rowKey };
  }

  private getUpdateValues(entity: SerializedEntity, mode: UpdateMode, etag: string) {
    const properties = getStoredProperties(entity);
    return {
      entity: mode === "Merge" ? sql`json_patch(${this.table.entity}, ${JSON.stringify(properties)})` : properties,
      etag,
    };
  }
}

// The keys are columns and the etag belongs to the row, so only the rest of an entity is stored as its JSON
const getStoredProperties = ({
  etag: _etag,
  partitionKey: _partitionKey,
  rowKey: _rowKey,
  ...properties
}: SerializedEntity): Record<string, unknown> => properties;
