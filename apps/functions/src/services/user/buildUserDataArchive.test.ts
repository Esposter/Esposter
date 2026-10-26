import type { Database, StandardMessageEntity } from "@esposter/db-schema";

import { getContainerClient } from "#src/services/azure/getContainerClient";
import { getTableClient } from "#src/services/azure/getTableClient";
import { createUser } from "#src/services/shared/createUser.test";
import { buildUserDataArchive } from "#src/services/user/buildUserDataArchive";
import { getResourceAssetBlobName } from "#src/services/user/getResourceAssetBlobName";
import {
  createMessage,
  getContentBlobName,
  getFileBlobNames,
  writeJsonBlob,
  writeModerationLogEntry,
} from "@esposter/db";
import { createMockDb } from "@esposter/db-mock";
import {
  accountsInAuth,
  AdminActionType,
  AzureContainer,
  AzureTable,
  getUserProfileImageBlobName,
  MessageType,
  ResourceType,
  resourcesInResource,
  resourceWorkingAssetsInResource,
  roomsInMessage,
  usersInAuth,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { jsonDateParse, takeOne } from "@esposter/shared";
import { MockBlobClient, MockContainerDatabase, MockTableDatabase } from "azure-mock";
import { strFromU8, unzipSync } from "fflate";
import { afterEach, assert, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDb;
  },
}));
vi.mock(import("#src/services/azure/getContainerClient"), () => import("#src/services/azure/getContainerClient.test"));
vi.mock(import("#src/services/azure/getTableClient"), () => import("#src/services/azure/getTableClient.test"));

describe(buildUserDataArchive, () => {
  const attachmentBytes = new Uint8Array([255]);
  const content = JSON.stringify({});
  const filename = "name";
  const message = "a";
  const name = "name";
  const otherMessage = "b";

  beforeAll(async () => {
    mockDb = await createMockDb();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    MockContainerDatabase.clear();
    MockTableDatabase.clear();
  });

  const readArchiveEntries = (blobName: string) => {
    const archiveBytes = MockContainerDatabase.get(AzureContainer.DataExports)?.get(blobName);
    assert.exists(archiveBytes);
    return unzipSync(archiveBytes);
  };
  const readEntryText = (entries: ReturnType<typeof unzipSync>, entryName: string) => {
    const entry = entries[entryName];
    assert.exists(entry);
    return strFromU8(entry);
  };
  const seedAttachment = async (blobName: string) => {
    const containerClient = await getContainerClient(AzureContainer.MessageAssets);
    await containerClient.getBlockBlobClient(blobName).upload(attachmentBytes, attachmentBytes.length);
  };

  test("unzips to the entries the design lists, and holds none of another person's messages", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    const otherUserId = crypto.randomUUID();
    const blobName = `${crypto.randomUUID()}.zip`;
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(otherUserId)]);
    await mockDb
      .insert(accountsInAuth)
      .values({ accountId: "accountId", id: crypto.randomUUID(), providerId: "providerId", userId });

    // A room the person is a member of, with their message and attachment beside the other person's message
    const room = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId: otherUserId }).returning());
    await mockDb.insert(usersToRoomsInMessage).values([
      { roomId: room.id, userId },
      { roomId: room.id, userId: otherUserId },
    ]);
    const file = {
      filename,
      hasThumbnail: false,
      id: crypto.randomUUID(),
      isSpoiler: false,
      mimetype: "mimetype",
      size: attachmentBytes.length,
    };
    const messageClient = await getTableClient(AzureTable.Messages);
    const messageAscendingClient = await getTableClient(AzureTable.MessagesAscending);
    await createMessage(messageClient, messageAscendingClient, {
      files: [file],
      message,
      roomId: room.id,
      type: MessageType.Message,
      userId,
    });
    await createMessage(messageClient, messageAscendingClient, {
      message: otherMessage,
      roomId: room.id,
      type: MessageType.Message,
      userId: otherUserId,
    });
    await seedAttachment(getFileBlobNames(room.id, file.id, file.filename).blobName);

    // A room the person has left, whose message is not in the archive
    const leftRoom = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId: otherUserId }).returning());
    await createMessage(messageClient, messageAscendingClient, {
      message,
      roomId: leftRoom.id,
      type: MessageType.Message,
      userId,
    });

    // The account's own stores: a save, a profile image, an owned resource with a working copy and asset, and a
    // moderation record naming the person as its target
    const savesContainerClient = await getContainerClient(AzureContainer.GenshinAssets);
    await writeJsonBlob(savesContainerClient, `${userId}/save.json`, content);
    const publicContainerClient = await getContainerClient(AzureContainer.PublicUserAssets);
    await publicContainerClient
      .getBlockBlobClient(getUserProfileImageBlobName(userId))
      .upload(attachmentBytes, attachmentBytes.length);
    const resource = takeOne(
      await mockDb.insert(resourcesInResource).values({ name, type: ResourceType.Blueprint, userId }).returning(),
    );
    const resourceContainerClient = await getContainerClient(AzureContainer.ResourceAssets);
    await writeJsonBlob(resourceContainerClient, getContentBlobName(resource.id), content);
    const assetHash = "0".repeat(64);
    await mockDb.insert(resourceWorkingAssetsInResource).values({ assetHash, resourceId: resource.id });
    await resourceContainerClient
      .getBlockBlobClient(getResourceAssetBlobName(resource.id, assetHash))
      .upload(attachmentBytes, attachmentBytes.length);
    await writeModerationLogEntry(await getTableClient(AzureTable.ModerationLog), {
      actorUserId: otherUserId,
      roomId: room.id,
      targetUserId: userId,
      type: AdminActionType.Warn,
    });

    await buildUserDataArchive(userId, blobName);
    const entries = readArchiveEntries(blobName);

    expect(Object.keys(entries).sort()).toStrictEqual(
      [
        "account.json",
        "images/ProfileImage",
        "moderation.json",
        `resources/${resource.id}/content.json`,
        `resources/${resource.id}/files/${assetHash}`,
        `resources/${resource.id}/resource.json`,
        `rooms/${room.id}/files/${file.id}/${file.filename}`,
        `rooms/${room.id}/messages.json`,
        "saves/genshin/save.json",
      ].sort(),
    );
    const messages = jsonDateParse<StandardMessageEntity[]>(readEntryText(entries, `rooms/${room.id}/messages.json`));
    expect(messages.map(({ message: text }) => text)).toStrictEqual([message]);
  });

  test("reads an attachment as a stream, never into a buffer", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    const blobName = `${crypto.randomUUID()}.zip`;
    await mockDb.insert(usersInAuth).values(createUser(userId));
    const room = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId }).returning());
    await mockDb.insert(usersToRoomsInMessage).values({ roomId: room.id, userId });
    const file = {
      filename,
      hasThumbnail: false,
      id: crypto.randomUUID(),
      isSpoiler: false,
      mimetype: "mimetype",
      size: attachmentBytes.length,
    };
    const attachmentBlobName = getFileBlobNames(room.id, file.id, file.filename).blobName;
    await createMessage(await getTableClient(AzureTable.Messages), await getTableClient(AzureTable.MessagesAscending), {
      files: [file],
      message,
      roomId: room.id,
      type: MessageType.Message,
      userId,
    });
    await seedAttachment(attachmentBlobName);
    const download = vi.spyOn(MockBlobClient.prototype, "download");
    const downloadToBuffer = vi.spyOn(MockBlobClient.prototype, "downloadToBuffer");

    await buildUserDataArchive(userId, blobName);

    expect(download.mock.contexts).toContainEqual(expect.objectContaining({ name: attachmentBlobName }));
    expect(downloadToBuffer.mock.contexts).not.toContainEqual(expect.objectContaining({ name: attachmentBlobName }));
  });
});
