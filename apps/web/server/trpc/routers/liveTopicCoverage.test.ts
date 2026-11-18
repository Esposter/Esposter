import type { Meta } from "#server/models/trpc/Meta";
import type { Context } from "#server/trpc/context";
import type { RecordedStatement } from "@esposter/db";
import type { Topic } from "@esposter/db-schema";
import type { AnyRouter } from "@trpc/server";

import { MockPublishedTopics } from "#server/services/realtime/publishTopics.test";
import { readTopicsHeader } from "#shared/services/realtime/readTopicsHeader";
import { getReadSet, getReadTopics, getSchemaTables, getWriteTopics, recordStatements } from "@esposter/db";
import { getTableName } from "drizzle-orm";
import { SQLiteDialect } from "drizzle-orm/sqlite-core";
import { expect } from "vitest";

// One procedure of a router, and the call that runs it through a caller built on the context it is handed. A call that
// Acts as another person spreads its own user over the context it is handed, so the context's database is shared
export interface LiveTopicCall {
  call: (context: Context) => Promise<unknown>;
  path: string;
}

// The cases of one router's procedures: every query that reads and every mutation that writes, set up on the context
export interface LiveTopicCalls {
  queries: LiveTopicCall[];
  writes: LiveTopicCall[];
}

const compareStrings = (first: string, second: string) => first.localeCompare(second);

// The answer each query gave, as its text, with the topics its response watched and the tables its statements read
interface Read {
  answer: string;
  tables: Set<string>;
  topics: Topic[];
}
type Reads = Map<string, Read>;

// The paths of a router's procedures of one type, leaving out those that declare a static reason, and those that declare
// Their topics by hand, which the cutover removes: until then their declaration is checked by nothing but themselves
const getWatchedPaths = (procedures: AnyRouter["_def"]["procedures"], type: string) =>
  Object.entries(procedures)
    .filter(([, procedure]) => {
      const meta = (procedure._def.meta ?? {}) as Meta;
      return procedure._def.type === type && meta.staticReason === undefined && meta.topics === undefined;
    })
    .map(([path]) => path)
    .toSorted(compareStrings);

const getPathsOf = (calls: LiveTopicCall[]) => calls.map(({ path }) => path).toSorted(compareStrings);

const getTopicsOf = (headers: Headers, path: string): Topic[] =>
  readTopicsHeader(headers, path).flatMap(({ topics }) => topics);

// The tables a set of topics names, each the text before its colon and dot. A read's topics and a write's name tables the same way
// A column's topic names its table before the dot, so a scoped read of a table meets a write to one of its columns
const getTopicTables = (topics: string[]) =>
  new Set(topics.map((topic) => topic.slice(0, topic.indexOf(":")).split(".")[0] ?? ""));

// The tables a write touches: those its topics name, which include the rows its cascade removes, so a read of a table the
// Cascade reached is rerun too
export const getTouchedTables = async (statements: RecordedStatement[]) =>
  getTopicTables(await getWriteTopics(statements));

// A router's live topics, checked from the procedures it runs rather than from a list of the topics it names. Every
// Procedure that declares no static reason has a case, every query's read set covers each table its SQL reads, and each
// Write that changes what a query answers is published to a topic that query watches. The queries of a check read the
// Same rows, so they run together; the writes run one after another, since each reads the rows the writes before it left
export const expectLiveTopicCoverage = async (
  router: AnyRouter,
  { queries, writes }: LiveTopicCalls,
  context: Context,
) => {
  expect(getPathsOf(queries)).toStrictEqual(getWatchedPaths(router._def.procedures, "query"));
  expect(getPathsOf(writes)).toStrictEqual(getWatchedPaths(router._def.procedures, "mutation"));

  const schemaTableNames = getSchemaTables().map((table) => getTableName(table));
  const uncoveredTables: string[] = [];
  await Promise.all(
    queries.map(async (query) => {
      const { database, statements } = recordStatements(context.db);
      await query.call({ ...context, db: database, responseHeaders: new Headers() });
      const readTableNames = new Set(getReadSet(statements).tables);
      for (const { statement } of statements) {
        const sql = new SQLiteDialect().sqlToQuery(statement.getSQL()).sql;
        for (const tableName of schemaTableNames)
          if (sql.includes(`"${tableName}"`) && !readTableNames.has(tableName))
            uncoveredTables.push(`${query.path}: ${tableName}`);
      }
    }),
  );
  expect(uncoveredTables.toSorted(compareStrings).join(", ")).toBe("");

  // Each write is checked against the reads it follows, and the reads it leaves are the ones the next write follows. A read
  // Reruns only when the write touched a table it reads, since no other write can change its answer
  const readQuery = async (query: LiveTopicCall): Promise<Read> => {
    const { database, statements } = recordStatements(context.db);
    const responseHeaders = new Headers();
    const answer = await query.call({ ...context, db: database, responseHeaders });
    const readTables = getTopicTables(await getReadTopics(statements));
    return { answer: JSON.stringify(answer), tables: readTables, topics: getTopicsOf(responseHeaders, query.path) };
  };

  const readQueries = async (): Promise<Reads> => {
    const reads: Reads = new Map();
    await Promise.all(queries.map(async (query) => reads.set(query.path, await readQuery(query))));
    return reads;
  };

  const unwokenReads: string[] = [];
  const checkWrite = async (write: LiveTopicCall, readsBefore: Reads): Promise<Reads> => {
    const { database, statements } = recordStatements(context.db);
    MockPublishedTopics.length = 0;
    await write.call({ ...context, db: database, responseHeaders: new Headers() });
    const published = new Set(MockPublishedTopics);
    const touched = await getTouchedTables(statements);
    const readsAfter: Reads = new Map();
    await Promise.all(
      queries.map(async (query) => {
        const before = readsBefore.get(query.path);
        const unchanged = before !== undefined && ![...before.tables].some((table) => touched.has(table));
        const after = unchanged ? before : await readQuery(query);
        readsAfter.set(query.path, after);
        if (after.answer !== before?.answer && !before?.topics.some((topic) => published.has(topic)))
          unwokenReads.push(`${write.path} -> ${query.path}`);
      }),
    );
    return readsAfter;
  };

  let reads = await readQueries();
  // oxlint-disable-next-line no-await-in-loop -- Each step reads the last: each write runs after the one before it, and reads the rows that one left
  for (const write of writes) reads = await checkWrite(write, reads);
  expect(unwokenReads.toSorted(compareStrings).join(", ")).toBe("");
};
