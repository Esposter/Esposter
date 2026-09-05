import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { BlobDeletionEventGridData } from "@esposter/db-schema";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { MAX_ROOM_EMOJI_SIZE_BYTES, MAX_ROOM_EMOJIS } from "#shared/services/message/constants";
import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { getRoomEmojiBlobName } from "@@/server/services/message/emoji/getRoomEmojiBlobName";
import { createCallerFactory } from "@@/server/trpc";
import { mockSessionOnce } from "@@/server/trpc/context.test";
import { roomEmojiRouter } from "@@/server/trpc/routers/room/emoji";
import { setupRoomSuite } from "@@/server/trpc/routers/setupRoomSuite.test";
import { AzureContainer, DatabaseEntityType, roomEmojisInMessage, RoomPermission } from "@esposter/db-schema";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { MockEventGridDatabase } from "azure-mock";
import { assert, beforeAll, beforeEach, describe, expect, test } from "vitest";

// Built from the same error the router throws, so an inline snapshot never bakes in a random id
const getRoomEmojiErrorMessage = (operation: Operation, context: string) =>
  new InvalidOperationError(operation, DatabaseEntityType.RoomEmoji, context).message;

describe("room/emoji", () => {
  const { createMember, getMockContext, getRoomId, setupMemberWithRole } = setupRoomSuite();
  let mockContext: Context;
  let roomEmojiCaller: DecorateRouterRecord<TRPCRouter["room"]["emoji"]>;
  let roomId: string;
  const name = "party_parrot";
  const mimetype = "image/png";
  const size = 1024;
  const OVERSIZED_SIZE = 1024 * 1024;
  // A slug the dataset owns, which a room may not shadow
  const UNICODE_EMOJI_SLUG = "fire";
  const position = 5;
  // The client's PUT, which is what makes the blob the create insists on exist
  const uploadRoomEmojiBlob = async (id: string, body = "") => {
    const containerClient = await useContainerClient(AzureContainer.MessageAssets);
    await containerClient.getBlockBlobClient(getRoomEmojiBlobName(roomId, id)).upload(body, body.length);
  };
  const createRoomEmoji = async (emojiName = name) => {
    const { id } = await roomEmojiCaller.generateUploadRoomEmojiSasEntity({ mimetype, roomId, size });
    await uploadRoomEmojiBlob(id);
    return roomEmojiCaller.createRoomEmoji({ id, name: emojiName, roomId });
  };

  beforeAll(() => {
    mockContext = getMockContext();
    roomEmojiCaller = createCallerFactory(roomEmojiRouter)(mockContext);
  });

  beforeEach(() => {
    roomId = getRoomId();
  });

  describe("generateUploadRoomEmojiSasEntity", () => {
    test("mints an id and a write target", async () => {
      expect.hasAssertions();

      const sasEntity = await roomEmojiCaller.generateUploadRoomEmojiSasEntity({ mimetype, roomId, size });

      expect(sasEntity.id).not.toBe("");
      expect(sasEntity.sasUrl).not.toBe("");
    });

    test("refuses anything but an image", async () => {
      expect.hasAssertions();

      await expect(
        roomEmojiCaller.generateUploadRoomEmojiSasEntity({ mimetype: "application/pdf", roomId, size }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: ${getRoomEmojiErrorMessage(Operation.Create, JSON.stringify({ mimetype: "application/pdf", size }))}]`,
      );
    });

    test("refuses a file past the emoji size cap", async () => {
      expect.hasAssertions();

      await expect(
        roomEmojiCaller.generateUploadRoomEmojiSasEntity({ mimetype, roomId, size: OVERSIZED_SIZE }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: ${getRoomEmojiErrorMessage(Operation.Create, JSON.stringify({ mimetype, size: OVERSIZED_SIZE }))}]`,
      );
    });

    test("refuses a room that already holds its cap", async () => {
      expect.hasAssertions();

      await mockContext.db.insert(roomEmojisInMessage).values(
        Array.from({ length: MAX_ROOM_EMOJIS }, (_, index) => ({
          name: `emoji_${index.toString()}`,
          roomId,
        })),
      );

      await expect(
        roomEmojiCaller.generateUploadRoomEmojiSasEntity({ mimetype, roomId, size }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: ${getRoomEmojiErrorMessage(Operation.Create, roomId)}]`,
      );
    });
  });

  describe("createRoomEmoji", () => {
    test("stores the row and hands back a read url for its blob", async () => {
      expect.hasAssertions();

      const roomEmoji = await createRoomEmoji();

      expect(roomEmoji.name).toBe(name);
      expect(roomEmoji.roomId).toBe(roomId);
      expect(roomEmoji.sasUrl).not.toBe("");
    });

    test("refuses an id whose blob never landed", async () => {
      expect.hasAssertions();

      const { id } = await roomEmojiCaller.generateUploadRoomEmojiSasEntity({ mimetype, roomId, size });

      await expect(roomEmojiCaller.createRoomEmoji({ id, name, roomId })).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: ${getRoomEmojiErrorMessage(Operation.Create, id)}]`,
      );
    });

    // Shadowing would make the same `:fire:` render differently per room, and deleting the custom entry would
    // Silently change every message that used it
    test("refuses a name a unicode slug already owns", async () => {
      expect.hasAssertions();

      await expect(createRoomEmoji(UNICODE_EMOJI_SLUG)).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: ${getRoomEmojiErrorMessage(Operation.Create, UNICODE_EMOJI_SLUG)}]`,
      );
    });

    test("refuses a blob larger than the cap whatever size was declared", async () => {
      expect.hasAssertions();

      const { id } = await roomEmojiCaller.generateUploadRoomEmojiSasEntity({ mimetype, roomId, size });
      await uploadRoomEmojiBlob(id, "a".repeat(MAX_ROOM_EMOJI_SIZE_BYTES + 1));

      await expect(roomEmojiCaller.createRoomEmoji({ id, name, roomId })).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: ${getRoomEmojiErrorMessage(Operation.Create, id)}]`,
      );
    });

    test("refuses a name the room already uses", async () => {
      expect.hasAssertions();

      await createRoomEmoji();

      await expect(createRoomEmoji()).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: ${getRoomEmojiErrorMessage(Operation.Create, JSON.stringify({ name, roomId }))}]`,
      );
    });

    test(`member without ${RoomPermission.ManageEmojis} cannot create — throws UNAUTHORIZED`, async () => {
      expect.hasAssertions();

      const member = await createMember();
      await mockSessionOnce(mockContext.db, member);

      await expect(
        roomEmojiCaller.generateUploadRoomEmojiSasEntity({ mimetype, roomId, size }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
    });

    test(`member with ${RoomPermission.ManageEmojis} can create`, async () => {
      expect.hasAssertions();

      const { member } = await setupMemberWithRole(RoomPermission.ManageEmojis, position);
      await mockSessionOnce(mockContext.db, member);
      const { id } = await roomEmojiCaller.generateUploadRoomEmojiSasEntity({ mimetype, roomId, size });
      await uploadRoomEmojiBlob(id);
      await mockSessionOnce(mockContext.db, member);
      const roomEmoji = await roomEmojiCaller.createRoomEmoji({ id, name, roomId });

      expect(roomEmoji.name).toBe(name);
    });
  });

  describe("updateRoomEmoji", () => {
    test("renames without disturbing the id every reaction keys on", async () => {
      expect.hasAssertions();

      const roomEmoji = await createRoomEmoji();
      const updatedRoomEmoji = await roomEmojiCaller.updateRoomEmoji({ id: roomEmoji.id, name: "renamed", roomId });

      expect(updatedRoomEmoji.id).toBe(roomEmoji.id);
      expect(updatedRoomEmoji.name).toBe("renamed");
    });

    test("refuses a name another emoji in the room holds", async () => {
      expect.hasAssertions();

      const roomEmoji = await createRoomEmoji();
      await createRoomEmoji("other_emoji");

      await expect(
        roomEmojiCaller.updateRoomEmoji({ id: roomEmoji.id, name: "other_emoji", roomId }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: ${getRoomEmojiErrorMessage(Operation.Update, roomEmoji.id)}]`,
      );
    });

    test("refuses a name a unicode slug already owns", async () => {
      expect.hasAssertions();

      const roomEmoji = await createRoomEmoji();

      await expect(
        roomEmojiCaller.updateRoomEmoji({ id: roomEmoji.id, name: UNICODE_EMOJI_SLUG, roomId }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: ${getRoomEmojiErrorMessage(Operation.Update, UNICODE_EMOJI_SLUG)}]`,
      );
    });
  });

  describe("deleteRoomEmoji", () => {
    test("removes the row and publishes the blob deletion", async () => {
      expect.hasAssertions();

      const roomEmoji = await createRoomEmoji();
      await roomEmojiCaller.deleteRoomEmoji({ id: roomEmoji.id, roomId });
      const blobDeletionEvents = MockEventGridDatabase.get("");
      assert(blobDeletionEvents);

      await expect(roomEmojiCaller.readRoomEmojis({ roomId })).resolves.toStrictEqual([]);
      expect(takeOne(blobDeletionEvents).data as BlobDeletionEventGridData).toStrictEqual({
        blobNames: [getRoomEmojiBlobName(roomId, roomEmoji.id)],
        containerName: AzureContainer.MessageAssets,
      });
    });

    test(`member without ${RoomPermission.ManageEmojis} cannot delete — throws UNAUTHORIZED`, async () => {
      expect.hasAssertions();

      const roomEmoji = await createRoomEmoji();
      const member = await createMember();
      await mockSessionOnce(mockContext.db, member);

      await expect(
        roomEmojiCaller.deleteRoomEmoji({ id: roomEmoji.id, roomId }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
    });
  });

  describe("readRoomEmojis", () => {
    test("a member reads the room's set with a url per entry", async () => {
      expect.hasAssertions();

      await createRoomEmoji();
      const member = await createMember();
      await mockSessionOnce(mockContext.db, member);
      const roomEmojis = await roomEmojiCaller.readRoomEmojis({ roomId });

      expect(roomEmojis).toHaveLength(1);
      expect(takeOne(roomEmojis).sasUrl).not.toBe("");
    });
  });
});
