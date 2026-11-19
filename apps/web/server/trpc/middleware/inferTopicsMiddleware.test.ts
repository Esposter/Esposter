import type { Context } from "#server/trpc/context";

import { getMockPublishedTopics, MockPublishedTopics } from "#server/services/realtime/publishTopics.test";
import { getBucket } from "#server/services/storage/getBucket";
import { mockBuckets } from "#server/services/storage/getBucket.test";
import { createMockAuthSession, createMockContext } from "#server/trpc/context.test";
import { createCallerFactory, publicProcedure, router } from "#server/trpc/index";
import { readTopicsHeader } from "#shared/services/realtime/readTopicsHeader";
import { createMockBucket } from "@esposter/db-mock";
import { StorageBucket, usersInAuth } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";
import { eq, getTableName } from "drizzle-orm";
import { afterEach, beforeAll, describe, expect, test } from "vitest";
import { z } from "zod";

type UserRow = typeof usersInAuth.$inferSelect;

const userInputSchema = z.string();
const renameInputSchema = z.object({ id: z.string(), name: z.string() });
const readUser = ({ ctx, input }: { ctx: Pick<Context, "db">; input: string }) =>
  ctx.db.query.usersInAuth.findFirst({ where: { id: { eq: input } } });
const renameUser = async ({ ctx, input }: { ctx: Pick<Context, "db">; input: z.output<typeof renameInputSchema> }) =>
  (await ctx.db.update(usersInAuth).set({ name: input.name }).where(eq(usersInAuth.id, input.id)).returning())[0];

const testRouter = router({
  putBlobThenFail: publicProcedure.input(userInputSchema).mutation<void>(async ({ input }) => {
    await getBucket(StorageBucket.UserAssets).put(input, "written");
    throw new TRPCError({ code: "BAD_REQUEST", message: "Write refused" });
  }),
  readStaticUser: publicProcedure
    .meta({ staticReason: "A test read that no topic watches" })
    .input(userInputSchema)
    .query<undefined | UserRow>(readUser),
  readUser: publicProcedure.input(userInputSchema).query<undefined | UserRow>(readUser),
  renameThenFail: publicProcedure.input(renameInputSchema).mutation<void>(async ({ ctx, input }) => {
    await renameUser({ ctx, input });
    throw new TRPCError({ code: "BAD_REQUEST", message: "Rename refused" });
  }),
  renameUser: publicProcedure.input(renameInputSchema).mutation<undefined | UserRow>(renameUser),
});

describe("inferTopicsMiddleware", () => {
  const createTestCaller = createCallerFactory(testRouter);
  const userTable = getTableName(usersInAuth);

  beforeAll(async () => {
    ({ bucket: mockBuckets[StorageBucket.UserAssets] } = await createMockBucket(StorageBucket.UserAssets));
  });

  afterEach(() => {
    MockPublishedTopics.length = 0;
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
      { columns: ["name", "updatedAt"], topic: `${userTable}:*` },
      { columns: ["name", "updatedAt"], topic: `${userTable}:id=${user.id}` },
    ]);
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
      { columns: ["name", "updatedAt"], topic: `${userTable}:*` },
      { columns: ["name", "updatedAt"], topic: `${userTable}:id=${user.id}` },
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
});
