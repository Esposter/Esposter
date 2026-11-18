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

const compareStrings = (first: string, second: string) => first.localeCompare(second);

// The paths of a router's procedures of one type, leaving out those that declare a static reason
const getWatchedPaths = (procedures: AnyRouter["_def"]["procedures"], type: string) =>
  Object.entries(procedures)
    .filter(
      ([, procedure]) =>
        procedure._def.type === type && ((procedure._def.meta ?? {}) as Meta).staticReason === undefined,
    )
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
  { queries, writes }: { queries: LiveTopicCall[]; writes: LiveTopicCall[] },
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

  // Each write reads the rows the writes before it left, so it runs after them and the check of each one reads the state
  // The write before it produced
  const checkWrite = async (write: LiveTopicCall): Promise<string[]> => {
    const readsBefore = new Map<string, { answer: string; topics: Topic[] }>();
    await Promise.all(
      queries.map(async (query) => {
        const responseHeaders = new Headers();
        const answer = await query.call({ ...context, responseHeaders });
        readsBefore.set(query.path, {
          answer: JSON.stringify(answer),
          topics: getTopicsOf(responseHeaders, query.path),
        });
      }),
    );

    MockPublishedTopics.length = 0;
    await write.call({ ...context, responseHeaders: new Headers() });
    const published = new Set(MockPublishedTopics);
    const unwoken = await Promise.all(
      queries.map(async (query) => {
        const { answer, topics } = readsBefore.get(query.path) ?? { answer: "", topics: [] };
        const answerAfter = JSON.stringify(await query.call({ ...context, responseHeaders: new Headers() }));
        return answerAfter !== answer && !topics.some((topic) => published.has(topic))
          ? [`${write.path} -> ${query.path}`]
          : [];
      }),
    );
    return unwoken.flat();
  };

  const unwokenReads: string[] = [];
  // oxlint-disable-next-line no-await-in-loop -- Each step reads the last: each write reads the rows the writes before it left
  for (const write of writes) unwokenReads.push(...(await checkWrite(write)));
  expect(unwokenReads.toSorted(compareStrings).join(", ")).toBe("");
};
