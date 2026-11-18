import { recordStatements } from "#src/services/realtime/recordStatements";
import { createMockDb } from "@esposter/db-mock";
import { roomsInMessage, usersInAuth } from "@esposter/db-schema";
import { exists, QueryPromise } from "drizzle-orm";
import { SQLiteAsyncCountBuilder, SQLiteAsyncRelationalQuery } from "drizzle-orm/sqlite-core";
import { describe, expect, test } from "vitest";

describe(recordStatements, () => {
  // A procedure reads through the handle, and every statement it awaits is what its topics are read from. A relational
  // Query, each statement of a batch and a count are the three shapes a read awaits. A builder that is never awaited
  // Runs nothing and is not a statement, nor is a subquery placed inside another statement
  test("records a relational query, a batch's statements and a count, and nothing built but not awaited", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const { database, statements } = recordStatements(db);

    await database.query.roomsInMessage.findFirst();
    database.select().from(usersInAuth);
    const batchResults = await database.batch([
      database
        .select()
        .from(usersInAuth)
        .where(exists(database.select().from(roomsInMessage))),
      database.select().from(roomsInMessage),
    ]);
    await database.$count(usersInAuth);

    expect(batchResults).toHaveLength(2);
    expect(statements).toHaveLength(4);
  });

  // A select is built in steps, and only its last step is a query, so the handle wraps the builder the first step returns
  test("records a select awaited through its builder chain", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const { database, statements } = recordStatements(db);

    await database.select().from(roomsInMessage);

    expect(statements).toHaveLength(1);
  });

  // The handle wraps the statements without patching drizzle's classes, so a recording never leaks into another request
  // That shares the classes. Each class's `then` is the one drizzle wrote before the handle was made
  test("leaves drizzle's query classes unpatched", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const queryPromiseThen = QueryPromise.prototype.then;
    const relationalQueryThen = SQLiteAsyncRelationalQuery.prototype.then;
    const countBuilderThen = SQLiteAsyncCountBuilder.prototype.then;
    const { database } = recordStatements(db);

    await database.query.roomsInMessage.findFirst();
    await database.$count(usersInAuth);

    expect(QueryPromise.prototype.then).toBe(queryPromiseThen);
    expect(SQLiteAsyncRelationalQuery.prototype.then).toBe(relationalQueryThen);
    expect(SQLiteAsyncCountBuilder.prototype.then).toBe(countBuilderThen);
  });
});
