import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers/index";
import type { R2Bucket } from "@cloudflare/workers-types";
import type { BlobDeletionQueueMessage } from "@esposter/db-schema";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { roomObjectCalls } from "#server/composables/realtime/useRoomObject.test";
import { mockBuckets } from "#server/services/storage/getBucket.test";
import { createMockAuthSession, createMockCaller } from "#server/trpc/context.test";
import { createCallerFactory } from "#server/trpc/index";
import { getUncoveredWrites } from "#server/trpc/optimisticWriteCrossCheck.test";
import { emojiRouter } from "#server/trpc/routers/room/emoji";
import { setupRoomSuite } from "#server/trpc/routers/setupRoomSuite.test";
import { MimeType } from "#shared/models/file/MimeType";
import { MAX_ROOM_EMOJI_SIZE_BYTES, MAX_ROOM_EMOJIS } from "#shared/services/message/constants";
import { DEVICE_ID_HEADER } from "#shared/services/realtime/constants";
import { roomEmojiTable } from "#src/services/message/room/overlay/constants";
import { getRoomEmojiPatchEntry } from "#src/services/message/room/overlay/getRoomEmojiPatchEntry";
import { getRowsPerStatement } from "@esposter/db";
import { createMockBucket, MockJobQueueDatabase } from "@esposter/db-mock";
import {
  DatabaseEntityType,
  getRoomEmojiBlobName,
  QueueJob,
  roomEmojisInMessage,
  RoomPermission,
  StorageBucket,
} from "@esposter/db-schema";
import { chunk, InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { afterAll, afterEach, assert, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

const getRoomEmojiErrorMessage = (operation: Operation, context: string) =>
  new InvalidOperationError(operation, DatabaseEntityType.RoomEmoji, context).message;

describe("emojiRouter", () => {
  const { createMember, getMockContext, getRoomId, setupMemberWithRole } = setupRoomSuite();
  let mockContext: Context;
  let roomEmojiCaller: DecorateRouterRecord<TRPCRouter["room"]["emoji"]>;
  let roomId: string;
  let bucket: R2Bucket;
  let dispose: () => Promise<void>;
  const name = "name";
  const updatedName = "a";
  const mimetype = MimeType.Png;
  const size = 1;
  const oversizedSize = MAX_ROOM_EMOJI_SIZE_BYTES + 1;
  // A slug the dataset owns, which a room may not shadow
  const unicodeEmojiSlug = "fire";
  const position = 1;
  // The client's PUT, which is what makes the blob the create insists on exist
  const uploadRoomEmojiBlob = async (id: string, body = "") => {
    await bucket.put(getRoomEmojiBlobName(roomId, id), body);
  };
  const createRoomEmoji = async (emojiName = name) => {
    const { id } = await roomEmojiCaller.generateUploadRoomEmojiPresignedUrlEntity({ mimetype, roomId, size });
    await uploadRoomEmojiBlob(id);
    return roomEmojiCaller.createRoomEmoji({ id, name: emojiName, roomId });
  };

  beforeAll(async () => {
    ({ bucket, dispose } = await createMockBucket(StorageBucket.MessageAssets));
    mockBuckets[StorageBucket.MessageAssets] = bucket;
    mockContext = getMockContext();
    roomEmojiCaller = createCallerFactory(emojiRouter)(mockContext);
  });

  beforeEach(() => {
    roomId = getRoomId();
    roomObjectCalls.length = 0;
  });

  afterEach(() => {
    vi.useRealTimers();
    mockContext.headers.delete(DEVICE_ID_HEADER);
  });

  afterAll(async () => {
    await dispose();
  });

  test("fails generateUploadRoomEmojiPresignedUrlEntity with anything but an image", async () => {
    expect.hasAssertions();

    await expect(
      roomEmojiCaller.generateUploadRoomEmojiPresignedUrlEntity({ mimetype: MimeType.Pdf, roomId, size }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${getRoomEmojiErrorMessage(Operation.Create, JSON.stringify({ mimetype: MimeType.Pdf, size }))}]`,
    );
  });

  test("fails generateUploadRoomEmojiPresignedUrlEntity with an svg image", async () => {
    expect.hasAssertions();

    await expect(
      roomEmojiCaller.generateUploadRoomEmojiPresignedUrlEntity({ mimetype: MimeType.Svg, roomId, size }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${getRoomEmojiErrorMessage(Operation.Create, JSON.stringify({ mimetype: MimeType.Svg, size }))}]`,
    );
  });

  test("fails generateUploadRoomEmojiPresignedUrlEntity with a file past the emoji size cap", async () => {
    expect.hasAssertions();

    await expect(
      roomEmojiCaller.generateUploadRoomEmojiPresignedUrlEntity({ mimetype, roomId, size: oversizedSize }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${getRoomEmojiErrorMessage(Operation.Create, JSON.stringify({ mimetype, size: oversizedSize }))}]`,
    );
  });

  test("fails generateUploadRoomEmojiPresignedUrlEntity with a room that already holds its cap", async () => {
    expect.hasAssertions();

    const roomEmojiRows = Array.from({ length: MAX_ROOM_EMOJIS }, (_value, index) => ({
      name: `emoji_${index}`,
      roomId,
    }));
    await Promise.all(
      chunk(roomEmojiRows, getRowsPerStatement(roomEmojisInMessage)).map((batch) =>
        mockContext.db.insert(roomEmojisInMessage).values(batch),
      ),
    );

    await expect(
      roomEmojiCaller.generateUploadRoomEmojiPresignedUrlEntity({ mimetype, roomId, size }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: ${getRoomEmojiErrorMessage(Operation.Create, roomId)}]`);
  });

  test("createRoomEmoji stores the row and hands back a read url for its blob", async () => {
    expect.hasAssertions();

    const roomEmoji = await createRoomEmoji();

    expect(roomEmoji.name).toBe(name);
    expect(roomEmoji.roomId).toBe(roomId);
    expect(roomEmoji.presignedUrl).toContain(getRoomEmojiBlobName(roomId, roomEmoji.id));
  });

  // The uploader chose the object's type, so a navigation to its read url downloads instead of rendering on the storage origin
  test("hands back a read url that answers as a download, so an uploaded svg is not rendered by navigation", async () => {
    expect.hasAssertions();

    const roomEmoji = await createRoomEmoji();

    expect(roomEmoji.presignedUrl).toContain("response-content-disposition=attachment");
  });

  test("fails createRoomEmoji with an id whose blob never landed", async () => {
    expect.hasAssertions();

    const { id } = await roomEmojiCaller.generateUploadRoomEmojiPresignedUrlEntity({ mimetype, roomId, size });

    await expect(roomEmojiCaller.createRoomEmoji({ id, name, roomId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${getRoomEmojiErrorMessage(Operation.Create, id)}]`,
    );
  });

  // Shadowing would make the same `:fire:` render differently per room, and deleting the custom entry would
  // Silently change every message that used it
  test("fails createRoomEmoji with a name a unicode slug already owns", async () => {
    expect.hasAssertions();

    await expect(createRoomEmoji(unicodeEmojiSlug)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${getRoomEmojiErrorMessage(Operation.Create, unicodeEmojiSlug)}]`,
    );
  });

  test("fails createRoomEmoji with a blob larger than the cap whatever size was declared", async () => {
    expect.hasAssertions();

    const { id } = await roomEmojiCaller.generateUploadRoomEmojiPresignedUrlEntity({ mimetype, roomId, size });
    await uploadRoomEmojiBlob(id, "a".repeat(MAX_ROOM_EMOJI_SIZE_BYTES + 1));

    await expect(roomEmojiCaller.createRoomEmoji({ id, name, roomId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${getRoomEmojiErrorMessage(Operation.Create, id)}]`,
    );
  });

  test("fails createRoomEmoji with a name the room already uses", async () => {
    expect.hasAssertions();

    await createRoomEmoji();

    await expect(createRoomEmoji()).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${getRoomEmojiErrorMessage(Operation.Create, JSON.stringify({ name, roomId }))}]`,
    );
  });

  // A replayed create names an id the room already holds, so it is refused as the name the room uses, not left to the
  // Primary key to refuse as a raw constraint error
  test("fails createRoomEmoji replayed with the id of an emoji the room already holds", async () => {
    expect.hasAssertions();

    const { id } = await roomEmojiCaller.generateUploadRoomEmojiPresignedUrlEntity({ mimetype, roomId, size });
    await uploadRoomEmojiBlob(id);
    await roomEmojiCaller.createRoomEmoji({ id, name, roomId });

    await expect(roomEmojiCaller.createRoomEmoji({ id, name, roomId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${getRoomEmojiErrorMessage(Operation.Create, JSON.stringify({ name, roomId }))}]`,
    );
  });

  test(`fails generateUploadRoomEmojiPresignedUrlEntity for a member without ${RoomPermission.ManageEmojis}`, async () => {
    expect.hasAssertions();

    const member = await createMember();
    const memberRoomEmojiCaller = await createMockCaller(
      emojiRouter,
      await createMockAuthSession(mockContext.db, member),
    );

    await expect(
      memberRoomEmojiCaller.generateUploadRoomEmojiPresignedUrlEntity({ mimetype, roomId, size }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test(`createRoomEmoji succeeds for a member with ${RoomPermission.ManageEmojis}`, async () => {
    expect.hasAssertions();

    const { member } = await setupMemberWithRole(RoomPermission.ManageEmojis, position);
    const memberRoomEmojiCaller = await createMockCaller(
      emojiRouter,
      await createMockAuthSession(mockContext.db, member),
    );
    const { id } = await memberRoomEmojiCaller.generateUploadRoomEmojiPresignedUrlEntity({ mimetype, roomId, size });
    await uploadRoomEmojiBlob(id);
    const roomEmoji = await memberRoomEmojiCaller.createRoomEmoji({ id, name, roomId });

    expect(roomEmoji.name).toBe(name);
  });

  test("updateRoomEmoji renames without disturbing the id every reaction keys on", async () => {
    expect.hasAssertions();

    const roomEmoji = await createRoomEmoji();
    const updatedRoomEmoji = await roomEmojiCaller.updateRoomEmoji({ id: roomEmoji.id, name: updatedName, roomId });

    expect(updatedRoomEmoji.id).toBe(roomEmoji.id);
    expect(updatedRoomEmoji.name).toBe(updatedName);
  });

  test("fails updateRoomEmoji with a name another emoji in the room holds", async () => {
    expect.hasAssertions();

    const roomEmoji = await createRoomEmoji();
    await createRoomEmoji(updatedName);

    await expect(
      roomEmojiCaller.updateRoomEmoji({ id: roomEmoji.id, name: updatedName, roomId }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${getRoomEmojiErrorMessage(Operation.Update, roomEmoji.id)}]`,
    );
  });

  test("fails updateRoomEmoji with a name a unicode slug already owns", async () => {
    expect.hasAssertions();

    const roomEmoji = await createRoomEmoji();

    await expect(
      roomEmojiCaller.updateRoomEmoji({ id: roomEmoji.id, name: unicodeEmojiSlug, roomId }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${getRoomEmojiErrorMessage(Operation.Update, unicodeEmojiSlug)}]`,
    );
  });

  test("deleteRoomEmoji keeps the row as a tombstone at a higher version and publishes the blob deletion", async () => {
    expect.hasAssertions();

    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
    const roomEmoji = await createRoomEmoji();
    const deletedRoomEmoji = await roomEmojiCaller.deleteRoomEmoji({ id: roomEmoji.id, roomId });
    const blobDeletionEvents = MockJobQueueDatabase.get(QueueJob.ProcessBlobDeletion);
    assert.exists(blobDeletionEvents);

    const roomEmojis = await roomEmojiCaller.readRoomEmojis({ roomId });

    expect(deletedRoomEmoji.version).toBe(roomEmoji.version + 1);
    expect(deletedRoomEmoji.deletedAt).toStrictEqual(new Date(0));
    expect(takeOne(roomEmojis).deletedAt).toStrictEqual(new Date(0));
    expect(takeOne(blobDeletionEvents) as BlobDeletionQueueMessage).toStrictEqual({
      blobNames: [getRoomEmojiBlobName(roomId, roomEmoji.id)],
      storageBucket: StorageBucket.MessageAssets,
    });
  });

  test("createRoomEmoji takes the name of a deleted emoji, which no longer holds it", async () => {
    expect.hasAssertions();

    const roomEmoji = await createRoomEmoji();
    await roomEmojiCaller.deleteRoomEmoji({ id: roomEmoji.id, roomId });
    const recreatedRoomEmoji = await createRoomEmoji(name);

    expect(recreatedRoomEmoji.name).toBe(name);
    expect(recreatedRoomEmoji.id).not.toBe(roomEmoji.id);
  });

  test("fails updateRoomEmoji for a deleted emoji", async () => {
    expect.hasAssertions();

    const roomEmoji = await createRoomEmoji();
    await roomEmojiCaller.deleteRoomEmoji({ id: roomEmoji.id, roomId });

    await expect(
      roomEmojiCaller.updateRoomEmoji({ id: roomEmoji.id, name: updatedName, roomId }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${getRoomEmojiErrorMessage(Operation.Update, roomEmoji.id)}]`,
    );
  });

  test(`fails deleteRoomEmoji for a member without ${RoomPermission.ManageEmojis}`, async () => {
    expect.hasAssertions();

    const roomEmoji = await createRoomEmoji();
    const member = await createMember();
    const memberRoomEmojiCaller = await createMockCaller(
      emojiRouter,
      await createMockAuthSession(mockContext.db, member),
    );

    await expect(
      memberRoomEmojiCaller.deleteRoomEmoji({ id: roomEmoji.id, roomId }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("readRoomEmojis returns the room's set with a url per entry", async () => {
    expect.hasAssertions();

    const roomEmoji = await createRoomEmoji();
    const member = await createMember();
    const memberRoomEmojiCaller = await createMockCaller(
      emojiRouter,
      await createMockAuthSession(mockContext.db, member),
    );
    const roomEmojis = await memberRoomEmojiCaller.readRoomEmojis({ roomId });

    expect(roomEmojis).toHaveLength(1);
    expect(takeOne(roomEmojis).presignedUrl).toContain(getRoomEmojiBlobName(roomId, roomEmoji.id));
  });

  // Each emoji write's optimistic entry shows every row its answer names, checked against the seeded state
  test("the emoji rename's entry covers the emoji row the server names", async () => {
    expect.hasAssertions();

    const roomEmoji = await createRoomEmoji();
    const { named, uncovered } = await getUncoveredWrites({
      call: (context) =>
        createCallerFactory(emojiRouter)(context).updateRoomEmoji({ id: roomEmoji.id, name: updatedName, roomId }),
      context: mockContext,
      entry: getRoomEmojiPatchEntry(roomEmoji.id, { name: updatedName }),
      path: "updateRoomEmoji",
      tables: [roomEmojiTable],
    });

    expect(named).toHaveLength(1);
    expect(uncovered).toStrictEqual([]);
  });

  test("the emoji delete's entry covers the emoji row the server names", async () => {
    expect.hasAssertions();

    const roomEmoji = await createRoomEmoji();
    const { named, uncovered } = await getUncoveredWrites({
      call: (context) => createCallerFactory(emojiRouter)(context).deleteRoomEmoji({ id: roomEmoji.id, roomId }),
      context: mockContext,
      entry: getRoomEmojiPatchEntry(roomEmoji.id, { deletedAt: new Date() }),
      path: "deleteRoomEmoji",
      tables: [roomEmojiTable],
    });

    expect(named).toHaveLength(1);
    expect(uncovered).toStrictEqual([]);
  });
});
