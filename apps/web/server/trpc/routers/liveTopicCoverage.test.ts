import type { Meta } from "#server/models/trpc/Meta";
import type { Context } from "#server/trpc/context";
import type { Topic } from "@esposter/db-schema";
import type { AnyRouter } from "@trpc/server";

import { MockPublishedTopics } from "#server/services/realtime/publishTopics.test";
import { readTopicsHeader } from "#shared/services/realtime/readTopicsHeader";
import { getReadSet, getSchemaTables, recordStatements } from "@esposter/db";
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

// The answer each query gave, as its text, with the topics its response watched
type Reads = Map<string, { answer: string; topics: Topic[] }>;

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

  // Each write reads the rows the writes before it left, so the reads a write is checked against are the reads the write before
  // It left behind: no write runs between the two, so a query runs once per write rather than once before and once after it
  const readQueries = async (): Promise<Reads> => {
    const reads: Reads = new Map();
    await Promise.all(
      queries.map(async (query) => {
        const responseHeaders = new Headers();
        const answer = await query.call({ ...context, responseHeaders });
        reads.set(query.path, { answer: JSON.stringify(answer), topics: getTopicsOf(responseHeaders, query.path) });
      }),
    );
    return reads;
  };

  const unwokenReads: string[] = [];
  // Each write is checked against the reads it follows, and the reads it leaves are the ones the next write follows
  const checkWrite = async (write: LiveTopicCall, readsBefore: Reads): Promise<Reads> => {
    MockPublishedTopics.length = 0;
    await write.call({ ...context, responseHeaders: new Headers() });
    const published = new Set(MockPublishedTopics);
    const readsAfter = await readQueries();
    for (const query of queries) {
      const { answer, topics } = readsBefore.get(query.path) ?? { answer: "", topics: [] };
      if (readsAfter.get(query.path)?.answer !== answer && !topics.some((topic) => published.has(topic)))
        unwokenReads.push(`${write.path} -> ${query.path}`);
    }
    return readsAfter;
  };

  let reads = await readQueries();
  // oxlint-disable-next-line no-await-in-loop -- Each step reads the last: each write runs after the one before it, and reads the rows that one left
  for (const write of writes) reads = await checkWrite(write, reads);
  expect(unwokenReads.toSorted(compareStrings).join(", ")).toBe("");
};
