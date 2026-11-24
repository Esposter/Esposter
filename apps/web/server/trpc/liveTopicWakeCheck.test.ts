import type { Meta } from "#server/models/trpc/Meta";
import type { Context } from "#server/trpc/context";
import type { ColumnTopic } from "@esposter/db-schema";
import type { WakeRecord } from "@esposter/shared-node/wake-check";
import type { AnyRouter } from "@trpc/server";

import { MockPublishedTopics } from "#server/services/realtime/publishTopics.test";
import { readTopicsHeader } from "#shared/services/realtime/readTopicsHeader";
import { transformer } from "#shared/services/trpc/transformer";
import { getWokenTopics } from "@esposter/db";
import { getResultAsync } from "@esposter/shared";
import { getWakeRecordDirectory } from "@esposter/shared-node/wake-check";
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, afterEach, describe, expect } from "vitest";

// The caller factory the wake check wraps, as tRPC's own `createCallerFactory` answers it
export type RawCallerFactory = (router: AnyRouter) => (context: Context) => unknown;

// A read answered by a query that published nothing, kept to be asked again after a later write. It is asked again as
// The Context it was answered in, so it is answered for the viewer it was answered for
interface ObservedRead {
  answer: string;
  args: unknown;
  context: Context;
  createCaller: RawCallerFactory;
  path: string;
  router: AnyRouter;
  topics: ColumnTopic[];
}

// What one call answered: its value or the error it threw, the topics header its response carried, and the publishes it
// Made
interface Outcome {
  error?: unknown;
  headers: Headers;
  ok: boolean;
  published: ColumnTopic[];
  value?: unknown;
}

// Every failure found since a test last took them, each naming the read a write changed and the write that changed it
let failures: string[] = [];
// The reads of the running test, each the latest answer it gave
let reads = new Map<string, ObservedRead>();
// The procedures this file called, as the router each was built in holds them.
// A suite builds its caller from its own router.
// So the app's path for a procedure is found from the app's router once the file's tests are done, not during them.
const calledProcedures = new Set<unknown>();
// What the wake check saw in this file, summed across the run by its teardown
const counts = { changed: 0, reruns: 0, writes: 0 };

// The app's procedures keyed by their own identity, which a suite's router shares with the app's: the path each is
// Called by In the app's router, and whether the run-level check requires a suite to call it (no static reason)
const getAppProcedures = async () => {
  const { trpcRouter }: { trpcRouter: AnyRouter } = await import("#server/trpc/routers/index");
  return Object.entries(trpcRouter._def.procedures).map(([path, procedure]) => ({
    path,
    procedure,
    watched: (procedure._def.meta as Meta | undefined)?.staticReason === undefined,
  }));
};

// A topic with the columns it is watched or published on, for a failure to name what woke and what did not
const formatColumnTopic = ({ columns, topic }: ColumnTopic) => (columns ? `${topic}[${columns.join(",")}]` : topic);

// The topics a response's header named for one procedure path
const getTopicsOf = (headers: Headers, path: string): ColumnTopic[] =>
  readTopicsHeader(headers, path).flatMap(({ topics }) => topics);

// The answer a call gave as its text, an error as the error's name and message An answer is compared as the app's
// Transformer carries it over the wire, so a BigInt (a role's permission bits) and a class Instance compare as the
// Client would see them, not as JSON drops them
const getAnswer = ({ error, ok, value }: Outcome) =>
  ok ? transformer.stringify(value) : `error: ${error instanceof Error ? error.message : String(error)}`;

// Calls one procedure through a caller built on a context of its own, so the response's topics header is its own
const callProcedure = async (
  createCaller: RawCallerFactory,
  router: AnyRouter,
  context: Context,
  path: string,
  args: unknown,
): Promise<Outcome> => {
  const headers = new Headers();
  const before = MockPublishedTopics.length;
  return getResultAsync(async () => {
    const caller = createCaller(router)({ ...context, responseHeaders: headers });
    const procedure = path
      .split(".")
      .reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], caller) as (
      input: unknown,
    ) => Promise<unknown>;
    return procedure(args);
  }).match(
    (value): Outcome => ({ headers, ok: true, published: MockPublishedTopics.slice(before), value }),
    (error): Outcome => ({ error, headers, ok: false, published: MockPublishedTopics.slice(before) }),
  );
};

// The writes a rerun was refused, counted so a read that tried to write is recognised whatever became of its error
let refusedWrites = 0;

// A database a rerun reads through: a write is refused before it is built, so asking a read again cannot change what
// The next Read answers. A procedure that writes after its answer (a view count, say) is refused the same way, through
// Its own call
const readOnlyDatabase = <T extends object>(database: T): T =>
  new Proxy(database, {
    get: (target, property) => {
      if (property === "delete" || property === "insert" || property === "transaction" || property === "update")
        return () => {
          refusedWrites++;
          throw new Error(`a rerun of a read refuses to ${property}`);
        };
      return Reflect.get(target, property, target);
    },
  });

// Asks every read the test answered again, after a write published `published`. A read whose answer changed must be one
// A Topic the write published wakes, by the topics the read watched before the write. A read that tried to write is no
// Read, so It is dropped rather than compared. The reads are asked one after another: a rerun's refused writes are
// Counted in one shared Counter, and its publishes are sliced from one shared record, so two reruns in flight would
// Count each other's
const rerunReads = async (published: ColumnTopic[], writePath: string, writeArgs: unknown) =>
  [...reads].reduce<Promise<void>>(async (previous, [key, read]) => {
    await previous;
    const watched = read.topics;
    const refusedBefore = refusedWrites;
    const outcome = await callProcedure(
      read.createCaller,
      read.router,
      { ...read.context, db: readOnlyDatabase(read.context.db) },
      read.path,
      read.args,
    );
    counts.reruns++;
    if (refusedWrites !== refusedBefore) {
      reads.delete(key);
      return;
    }
    const answer = getAnswer(outcome);
    if (answer !== read.answer) {
      counts.changed++;
      if (getWokenTopics(watched, published).length === 0)
        failures.push(
          `${read.path}(${JSON.stringify(read.args)}) changed by ${writePath}(${JSON.stringify(writeArgs)}), which no topic it watches woke (it now answers ${answer}; it watches ${JSON.stringify(watched.map((topic) => formatColumnTopic(topic)))}; the write published ${JSON.stringify(published.map((topic) => formatColumnTopic(topic)))})`,
        );
    }
    read.answer = answer;
    // A read that now answers an error, or names no topic, keeps the topics it watched, since no write it watched is
    // Gone
    const topics = getTopicsOf(outcome.headers, read.path);
    if (outcome.ok && topics.length > 0) read.topics = topics;
  }, Promise.resolve());

// Calls a procedure through its caller and, if it published anything or is a mutation, asks every read again. A query
// That Published nothing is a read, kept for the rerun; a call that published is a write, which a query can be, and is
// Never asked Again. A mutation is asked whether or not it published: a write made outside the recorder publishes
// Nothing, and that miss Is what the check exists to find
const invokeProcedure = async (
  createCaller: RawCallerFactory,
  router: AnyRouter,
  context: Context,
  path: string,
  args: unknown,
) => {
  const outcome = await callProcedure(createCaller, router, context, path, args);
  calledProcedures.add(router._def.procedures[path]);
  for (const [name, value] of outcome.headers) context.responseHeaders.append(name, value);
  const publishes = outcome.published.length;
  const type = router._def.procedures[path]?._def.type;
  if (publishes > 0) counts.writes++;
  if (publishes > 0 || type === "mutation") {
    const mark = MockPublishedTopics.length;
    await rerunReads(outcome.published, path, args);
    // A reread's own publishes are not the call's, so they leave the record of what the call published
    MockPublishedTopics.length = mark;
  }
  if (outcome.ok && publishes === 0 && type === "query") {
    const topics = getTopicsOf(outcome.headers, path);
    if (topics.length > 0)
      reads.set(JSON.stringify([path, args, context.user?.id ?? null]), {
        answer: getAnswer(outcome),
        args,
        context,
        createCaller,
        path,
        router,
        topics,
      });
  }
  if (!outcome.ok) throw outcome.error;
  return outcome.value;
};

// A caller whose every procedure call runs through the wake check. The proxy answers each property with its path, so a
// Call Names the procedure it runs, and a property that is a router's namespace answers a further proxy
export const createWakeCheckedCaller = (
  createCaller: RawCallerFactory,
  router: AnyRouter,
  context: Context,
): unknown => {
  const navigate = (segments: string[]): unknown =>
    new Proxy(() => undefined, {
      apply: (_target, _thisArgument, args: unknown[]) =>
        invokeProcedure(createCaller, router, context, segments.join("."), args[0]),
      get: (_target, key) => (typeof key === "string" && key !== "then" ? navigate([...segments, key]) : undefined),
    });
  return navigate([]);
};

// Takes the failures found since the last take, which a self-test reads before the after-each check does
export const takeWakeFailures = (): string[] => {
  const taken = failures;
  failures = [];
  return taken;
};

// Asserts after each test that no write changed a read it did not wake, then forgets the test's reads
const verifyWakes = () => {
  expect(takeWakeFailures()).toStrictEqual([]);
  reads = new Map();
};

// Leaves one record per test file that made a call, which the run-level check reads across every file of the run
const writeWakeRecord = async () => {
  if (calledProcedures.size === 0 && counts.writes === 0) return;
  const appProcedures = await getAppProcedures();
  const called = appProcedures.filter(({ procedure }) => calledProcedures.has(procedure)).map(({ path }) => path);
  const directory = getWakeRecordDirectory(process.cwd());
  mkdirSync(directory, { recursive: true });
  const { testPath } = expect.getState();
  const file = createHash("sha256").update(String(testPath)).digest("hex").slice(0, 16);
  const record: WakeRecord = {
    called: called.toSorted((firstPath, secondPath) => firstPath.localeCompare(secondPath)),
    counts,
    file: String(testPath),
    watched: appProcedures.filter(({ watched }) => watched).map(({ path }) => path),
  };
  writeFileSync(join(directory, `${file}.json`), JSON.stringify(record));
};

// Registered as the check loads, which is during the collection of a file whose caller reaches it, so a file that
// Builds No caller never loads the check
afterEach(verifyWakes);

afterAll(writeWakeRecord);

// Describes nothing: the check is imported by the caller factory, which its self-test runs beside
describe.todo("liveTopicWakeCheck");
