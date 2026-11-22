import type { Context } from "#server/trpc/context";
import type { ColumnTopic } from "@esposter/db-schema";

import { insertRows } from "#server/services/db/insertRows.test";
import { getMockPublishedTopics, MockPublishedTopics } from "#server/services/realtime/publishTopics.test";
import { recordObjectReads } from "#server/services/realtime/recordObjectReads";
import { confirmBlobUpload } from "#server/services/storage/confirmBlobUpload";
import { getBucket } from "#server/services/storage/getBucket";
import { mockBuckets } from "#server/services/storage/getBucket.test";
import { createMockAuthSession, createMockContext, createMockUser } from "#server/trpc/context.test";
import { createCallerFactory, publicProcedure, router } from "#server/trpc/index";
import { ROW_VERSIONS_HEADER } from "#shared/services/realtime/constants";
import { readTopicsHeader } from "#shared/services/realtime/readTopicsHeader";
import { getWokenTopics, inJsonArray } from "@esposter/db";
import { createMockBucket } from "@esposter/db-mock";
import {
  getBlobTopic,
  getStorageBucketBindingName,
  getTopicWatchPayload,
  invitesInMessage,
  MAX_READ_TOPICS,
  MAX_WRITE_ROW_VERSIONS,
  roomsInMessage,
  RoomType,
  StorageBucket,
  usersInAuth,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { generateSecretToken, takeOne } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq, getTableName } from "drizzle-orm";
import { createHmac } from "node:crypto";
import { v7 } from "uuid";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";
import { z } from "zod";

type UserRow = typeof usersInAuth.$inferSelect;

const userInputSchema = z.string();
const renameInputSchema = z.object({ id: z.string(), name: z.string() });
const readUser = ({ ctx, input }: { ctx: Pick<Context, "db">; input: string }) =>
  ctx.db.query.usersInAuth.findFirst({ where: { id: { eq: input } } });
const renameUser = async ({ ctx, input }: { ctx: Pick<Context, "db">; input: z.output<typeof renameInputSchema> }) =>
  (await ctx.db.update(usersInAuth).set({ name: input.name }).where(eq(usersInAuth.id, input.id)).returning())[0];

const testRouter = router({
  confirmUpload: publicProcedure.input(userInputSchema).mutation<void>(({ input }) => {
    confirmBlobUpload(StorageBucket.UserAssets, input);
  }),
  putBlob: publicProcedure.input(userInputSchema).mutation<void>(async ({ input }) => {
    await getBucket(StorageBucket.UserAssets).put(input, "written");
  }),
  putBlobThenFail: publicProcedure.input(userInputSchema).mutation<void>(async ({ input }) => {
    await getBucket(StorageBucket.UserAssets).put(input, "written");
    throw new TRPCError({ code: "BAD_REQUEST", message: "Write refused" });
  }),
  readBlobs: publicProcedure.input(z.array(z.string())).query<null>(async ({ input }) => {
    await Promise.all(input.map((key) => getBucket(StorageBucket.UserAssets).get(key)));
    return null;
  }),
  readNamesByIds: publicProcedure
    .input(z.array(z.string()))
    .query<{ name: string }[]>(({ ctx, input }) =>
      ctx.db.select({ name: usersInAuth.name }).from(usersInAuth).where(inJsonArray(usersInAuth.id, input)),
    ),
  readNamesInBothLists: publicProcedure
    .input(z.object({ ids: z.array(z.string()), otherIds: z.array(z.string()) }))
    .query<{ name: string }[]>(({ ctx, input }) =>
      ctx.db
        .select({ name: usersInAuth.name })
        .from(usersInAuth)
        .where(and(inJsonArray(usersInAuth.id, input.ids), inJsonArray(usersInAuth.id, input.otherIds))),
    ),
  // Each room's object reports the read set of its own messages, as the room's stub does through recordObjectReads
  readRoomMessages: publicProcedure.input(z.array(z.string())).query<null>(({ input }) => {
    recordObjectReads(input.map((roomId): ColumnTopic => ({ topic: `room/${roomId}:messages:*` })));
    return null;
  }),
  readRoomsOf: publicProcedure
    .input(userInputSchema)
    .query<{ id: string }[]>(({ ctx, input }) =>
      ctx.db
        .select({ id: roomsInMessage.id })
        .from(roomsInMessage)
        .leftJoin(usersToRoomsInMessage, eq(usersToRoomsInMessage.roomId, roomsInMessage.id))
        .where(eq(roomsInMessage.userId, input)),
    ),
  readStaticUser: publicProcedure
    .meta({ staticReason: "A test read that no topic watches" })
    .input(userInputSchema)
    .query<undefined | UserRow>(readUser),
  readUser: publicProcedure.input(userInputSchema).query<undefined | UserRow>(readUser),
  renameThenFail: publicProcedure.input(renameInputSchema).mutation<void>(async ({ ctx, input }) => {
    await renameUser({ ctx, input });
    throw new TRPCError({ code: "BAD_REQUEST", message: "Rename refused" });
  }),
  renameUnreturned: publicProcedure.input(renameInputSchema).mutation<void>(async ({ ctx, input }) => {
    await ctx.db.update(usersInAuth).set({ name: input.name }).where(eq(usersInAuth.id, input.id));
  }),
  renameUser: publicProcedure.input(renameInputSchema).mutation<undefined | UserRow>(renameUser),
  renameUsers: publicProcedure
    .input(z.object({ ids: z.array(z.string()), name: z.string() }))
    .mutation<void>(async ({ ctx, input }) => {
      await ctx.db.update(usersInAuth).set({ name: input.name }).where(inJsonArray(usersInAuth.id, input.ids));
    }),
  useInvite: publicProcedure.input(z.string()).mutation<void>(async ({ ctx, input }) => {
    await ctx.db.update(invitesInMessage).set({ uses: 1 }).where(eq(invitesInMessage.id, input)).returning();
  }),
});

describe("inferTopicsMiddleware", () => {
  const createTestCaller = createCallerFactory(testRouter);
  const roomTable = getTableName(roomsInMessage);
  const userTable = getTableName(usersInAuth);
  const usersToRoomTable = getTableName(usersToRoomsInMessage);
  const userAssetsRootTopic = getBlobTopic(getStorageBucketBindingName(StorageBucket.UserAssets), "");
  const inviteTable = getTableName(invitesInMessage);

  beforeAll(async () => {
    ({ bucket: mockBuckets[StorageBucket.UserAssets] } = await createMockBucket(StorageBucket.UserAssets));
  });

  afterEach(() => {
    MockPublishedTopics.length = 0;
    vi.unstubAllEnvs();
  });

  // A query's topics are the rows its statements selected, named by the scope values of the table, so the answer is
  // Watched through the row it read and no other
  test("sends a query's inferred topics back on its response, named by the rows its statement selected", async () => {
    expect.hasAssertions();

    const context = await createMockContext();
    const { user } = await createMockAuthSession(context.db);
    await createTestCaller(context).readUser(user.id);

    expect(
      readTopicsHeader(context.responseHeaders, "readUser").flatMap(({ topics }) => topics.map(({ topic }) => topic)),
    ).toStrictEqual([`${userTable}:id=${user.id}`]);
  });

  // A mutation publishes what its writes changed: the table, and each row's scope values from the rows it returned
  test("publishes a mutation's inferred topics once it resolves", async () => {
    expect.hasAssertions();

    const context = await createMockContext();
    const { user } = await createMockAuthSession(context.db);
    await createTestCaller(context).renameUser({ id: user.id, name: "renamed" });

    expect(MockPublishedTopics).toStrictEqual([
      { columns: ["name", "updatedAt", "version"], topic: `${userTable}:*` },
      { columns: ["name", "updatedAt", "version"], topic: `${userTable}:id=${user.id}` },
    ]);
  });

  // A mutation names each row it changed by its key and version, so its answer settles the entry the write made at that version
  test("names each row a mutation changed by its key and version in the row versions header", async () => {
    expect.hasAssertions();

    const context = await createMockContext();
    const { user } = await createMockAuthSession(context.db);
    await createTestCaller(context).renameUser({ id: user.id, name: "renamed" });

    expect(context.responseHeaders.get(ROW_VERSIONS_HEADER)).toBe(
      `renameUser ${encodeURIComponent(JSON.stringify({ key: { id: user.id }, table: userTable, version: 1 }))}`,
    );
  });

  // A write that asks for no RETURNING is widened to name its rows, so it names the version it left them at as well
  test("names the rows of a write that asks for no RETURNING, at the version the write left them", async () => {
    expect.hasAssertions();

    const context = await createMockContext();
    const { user } = await createMockAuthSession(context.db);
    await createTestCaller(context).renameUnreturned({ id: user.id, name: "renamed" });

    expect(context.responseHeaders.get(ROW_VERSIONS_HEADER)).toBe(
      `renameUnreturned ${encodeURIComponent(JSON.stringify({ key: { id: user.id }, table: userTable, version: 1 }))}`,
    );
  });

  // A write names its rows in the header only while they fit it: one that changed more rows than the header's budget names none,
  // So the header never grows with the write. Its entry drops on the answer, and its rows come back through the topic refetch
  test("names none of a mutation's rows once it changed more than the header can name", async () => {
    expect.hasAssertions();

    const context = await createMockContext();
    const ids = Array.from({ length: MAX_WRITE_ROW_VERSIONS + 1 }, () => v7());
    await insertRows(
      context.db,
      usersInAuth,
      ids.map((id) => ({ email: id, emailVerified: true, id, name: "name" })),
    );
    await createTestCaller(context).renameUsers({ ids, name: "renamed" });

    expect(context.responseHeaders.get(ROW_VERSIONS_HEADER)).toBeNull();
  });

  // The rows a write names are as many as the header's budget holds, each at its own version
  test("names every row of a mutation that changed no more than the header can name", async () => {
    expect.hasAssertions();

    const context = await createMockContext();
    const ids = Array.from({ length: MAX_WRITE_ROW_VERSIONS }, () => v7());
    await insertRows(
      context.db,
      usersInAuth,
      ids.map((id) => ({ email: id, emailVerified: true, id, name: "name" })),
    );
    await createTestCaller(context).renameUsers({ ids, name: "renamed" });

    expect(context.responseHeaders.get(ROW_VERSIONS_HEADER)?.split(", ")).toHaveLength(MAX_WRITE_ROW_VERSIONS);
  });

  // An invite is keyed by its code, a credential, so the header names no invite row: neither the code nor its digest reaches it
  test("names no invite row in the row versions header, so the credential never reaches it", async () => {
    expect.hasAssertions();

    const context = await createMockContext();
    const { user } = await createMockAuthSession(context.db);
    const room = takeOne(await context.db.insert(roomsInMessage).values({ name: "room", userId: user.id }).returning());
    const token = generateSecretToken();
    await context.db.insert(invitesInMessage).values({ id: token, roomId: room.id, userId: user.id });
    await createTestCaller(context).useInvite(token);

    const rowVersionsHeader = context.responseHeaders.get(ROW_VERSIONS_HEADER) ?? "";
    expect(rowVersionsHeader).not.toContain(inviteTable);
    expect(rowVersionsHeader).not.toContain(token);
  });

  // A read's topics are watched only by the person who read them, so the header signs them for that person: the realtime
  // Object takes a watch for them only when the signature covers the topics, the read's time and the person it names
  test("a signed-in query's topics are signed for the person who read them", async () => {
    expect.hasAssertions();

    const topicWatchSecret = "topic-watch-secret";
    vi.stubEnv("TOPIC_WATCH_SECRET", topicWatchSecret);
    const context = await createMockContext();
    const { session, user } = await createMockAuthSession(context.db);
    const signedInContext = { ...context, session, user };
    await createTestCaller(signedInContext).readUser(user.id);
    const [read] = readTopicsHeader(signedInContext.responseHeaders, "readUser");

    expect(read?.signature).toBe(
      createHmac("sha256", topicWatchSecret)
        .update(getTopicWatchPayload(user.id, read?.readAt ?? 0, read?.topics ?? []))
        .digest("base64url"),
    );
  });

  // A signed-out read has no person a watch could be made for, so its topics carry an empty signature no socket can use
  test("a signed-out query's topics carry an empty signature", async () => {
    expect.hasAssertions();

    const context = await createMockContext(null);
    await createTestCaller(context).readUser(v7());

    expect(readTopicsHeader(context.responseHeaders, "readUser").map(({ signature }) => signature)).toStrictEqual([""]);
  });

  // A procedure with a static reason is watched by no topic, however its statement reads
  test("sends no topics for a procedure that declares a static reason", async () => {
    expect.hasAssertions();

    const context = await createMockContext();
    const { user } = await createMockAuthSession(context.db);
    await createTestCaller(context).readStaticUser(user.id);

    expect(readTopicsHeader(context.responseHeaders, "readStaticUser")).toStrictEqual([]);
  });

  // A mutation that fails after its write still publishes the write, since the write landed before the failure
  test("publishes a mutation's writes when it fails after them", async () => {
    expect.hasAssertions();

    const context = await createMockContext();
    const { user } = await createMockAuthSession(context.db);
    await expect(
      createTestCaller(context).renameThenFail({ id: user.id, name: "refused" }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: Rename refused]`);

    expect(MockPublishedTopics).toStrictEqual([
      { columns: ["name", "updatedAt", "version"], topic: `${userTable}:*` },
      { columns: ["name", "updatedAt", "version"], topic: `${userTable}:id=${user.id}` },
    ]);
  });

  // A blob a failed mutation wrote is published too, for the same reason as a row it wrote
  test("publishes a blob a mutation wrote before it failed", async () => {
    expect.hasAssertions();

    const key = "inferred/failed-write";
    await expect(
      createTestCaller(await createMockContext()).putBlobThenFail(key),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: Write refused]`);

    expect(getMockPublishedTopics()).toContain(`USER_ASSETS:${key}`);
  });

  // A read under the budget names each row it read, as it always has
  test("names each row a read under the budget read, unchanged", async () => {
    expect.hasAssertions();

    const context = await createMockContext();
    const firstUserId = v7();
    const secondUserId = v7();
    await createTestCaller(context).readNamesByIds([firstUserId, secondUserId]);

    expect(
      readTopicsHeader(context.responseHeaders, "readNamesByIds").flatMap(({ topics }) =>
        topics.map(({ topic }) => topic),
      ),
    ).toStrictEqual([`${userTable}:id=${firstUserId}`, `${userTable}:id=${secondUserId}`].toSorted());
  });

  // A list past the budget names no row of its own: its table's row topics collapse to the table-wide topic, which every write
  // To the table publishes, so the read is still woken by a write to any of its rows
  test("collapses a table a list names past the header's budget to its table-wide topic", async () => {
    expect.hasAssertions();

    const context = await createMockContext();
    const ids = Array.from({ length: MAX_READ_TOPICS + 1 }, () => v7());
    await createTestCaller(context).readNamesByIds(ids);

    expect(
      readTopicsHeader(context.responseHeaders, "readNamesByIds").flatMap(({ topics }) =>
        topics.map(({ topic }) => topic),
      ),
    ).toStrictEqual([`${userTable}:*`]);
  });

  // Two lists in one `and` count together, so each can be under the budget and the pair still past it
  test("collapses a table two lists in one and name together past the header's budget", async () => {
    expect.hasAssertions();

    const context = await createMockContext();
    const halfLength = MAX_READ_TOPICS / 2 + 1;
    const ids = Array.from({ length: halfLength }, () => v7());
    const otherIds = Array.from({ length: halfLength }, () => v7());
    await createTestCaller(context).readNamesInBothLists({ ids, otherIds });

    expect(
      readTopicsHeader(context.responseHeaders, "readNamesInBothLists").flatMap(({ topics }) =>
        topics.map(({ topic }) => topic),
      ),
    ).toStrictEqual([`${userTable}:*`]);
  });

  // A join returns a row per membership, and each row names the room its membership is in. A join past the budget's rows
  // Collapses the table it reads, which is the table holding the most row topics
  test("collapses a table a join returns more rows of than the header's budget", async () => {
    expect.hasAssertions();

    const context = await createMockContext();
    const user = await createMockUser(context.db);
    const roomIds = Array.from({ length: MAX_READ_TOPICS + 1 }, () => v7());
    await insertRows(
      context.db,
      roomsInMessage,
      roomIds.map((id) => ({ id, name: "name", type: RoomType.Room, userId: user.id })),
    );
    await insertRows(
      context.db,
      usersToRoomsInMessage,
      roomIds.map((roomId) => ({ roomId, userId: user.id })),
    );
    await createTestCaller(context).readRoomsOf(user.id);

    expect(
      readTopicsHeader(context.responseHeaders, "readRoomsOf").flatMap(({ topics }) =>
        topics.map(({ topic }) => topic),
      ),
    ).toStrictEqual([`${roomTable}:*`, `${usersToRoomTable}:*`]);
  });

  // A read names one topic per room it reads, each the room's own messages. Past the header's budget those collapse to the room
  // Kind's table topic, which every room's write publishes, so the read still fits and is woken by a write in any room
  test("collapses a read over more rooms than the header's budget to the room kind's table topic", async () => {
    expect.hasAssertions();

    const context = await createMockContext();
    await createTestCaller(context).readRoomMessages(Array.from({ length: MAX_READ_TOPICS + 1 }, () => v7()));

    expect(
      readTopicsHeader(context.responseHeaders, "readRoomMessages").flatMap(({ topics }) =>
        topics.map(({ topic }) => topic),
      ),
    ).toStrictEqual(["room/*:messages:*"]);
  });

  // A write to a row a collapsed read does not name wakes the read through its table's topic, which the write publishes
  test("wakes a read whose table collapsed for a write to a row it did not name", async () => {
    expect.hasAssertions();

    const context = await createMockContext();
    const other = await createMockUser(context.db);
    const halfLength = MAX_READ_TOPICS / 2 + 1;
    await createTestCaller(context).readNamesInBothLists({
      ids: Array.from({ length: halfLength }, () => v7()),
      otherIds: Array.from({ length: halfLength }, () => v7()),
    });
    const readTopics = readTopicsHeader(context.responseHeaders, "readNamesInBothLists").flatMap(
      ({ topics }) => topics,
    );
    await createTestCaller(context).renameUser({ id: other.id, name: "renamed" });

    expect(getWokenTopics(readTopics, MockPublishedTopics)).toStrictEqual([`${userTable}:*`]);
  });

  // A read names one blob topic per key it reads. Past the header's budget its keys collapse to their bucket's root, which every
  // Write to the bucket publishes, as a table's rows collapse to its table-wide topic
  test("collapses a bucket a read names past the header's budget to the bucket's root topic", async () => {
    expect.hasAssertions();

    const context = await createMockContext();
    await createTestCaller(context).readBlobs(Array.from({ length: MAX_READ_TOPICS + 1 }, () => v7()));

    expect(
      readTopicsHeader(context.responseHeaders, "readBlobs").flatMap(({ topics }) => topics.map(({ topic }) => topic)),
    ).toStrictEqual([userAssetsRootTopic]);
  });

  // The root is published by a write to any key of the bucket, so a collapsed read is woken by a write to a key it did not name
  test("wakes a read whose blobs collapsed for a write to a key it did not name", async () => {
    expect.hasAssertions();

    const context = await createMockContext();
    await createTestCaller(context).readBlobs(Array.from({ length: MAX_READ_TOPICS + 1 }, () => v7()));
    const readTopics = readTopicsHeader(context.responseHeaders, "readBlobs").flatMap(({ topics }) => topics);
    await createTestCaller(context).putBlob(v7());

    expect(getWokenTopics(readTopics, MockPublishedTopics)).toStrictEqual([userAssetsRootTopic]);
  });

  // A presigned upload lands in R2 without its bucket binding, so the PUT itself publishes nothing. The confirm that records the key
  // Publishes its write as a put's topics do, so a read of the key wakes once the upload is confirmed
  test("wakes a read of a key once a confirm records the presigned upload that landed there", async () => {
    expect.hasAssertions();

    const context = await createMockContext();
    const key = v7();
    await createTestCaller(context).readBlobs([key]);
    const readTopics = readTopicsHeader(context.responseHeaders, "readBlobs").flatMap(({ topics }) => topics);
    await createTestCaller(context).confirmUpload(key);

    expect(getWokenTopics(readTopics, MockPublishedTopics)).toStrictEqual([
      getBlobTopic(getStorageBucketBindingName(StorageBucket.UserAssets), key),
    ]);
  });
});
