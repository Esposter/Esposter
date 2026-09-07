// @vitest-environment nuxt
import type { ComposerTarget } from "@/models/message/ComposerTarget";
import type { Router } from "vue-router";

import { MessageHookMap } from "@/services/message/MessageHookMap";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useDataStore } from "@/store/message/data";
import { useUploadFileStore } from "@/store/message/input/uploadFile";
import { useThreadFollowStore } from "@/store/message/threadFollow";
import { getMockSession } from "@@/server/trpc/context.test";
import { createMessageEntity, MessageType } from "@esposter/db-schema";
import { Operation, takeOne } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

interface MockSessionValue {
  data?: { user: { id: string } };
}
const { useSessionMock } = vi.hoisted(() => ({ useSessionMock: vi.fn<() => Ref<MockSessionValue>>() }));

vi.mock(import("@/services/auth/authClient"), () => ({
  authClient: { useSession: useSessionMock } as unknown as (typeof import("@/services/auth/authClient"))["authClient"],
}));

describe(useDataStore, () => {
  const server = setupMswTrpc();
  let router: Router;
  const roomId = crypto.randomUUID();
  // Every send here is the room's own composer, which is the target `sendMessage` defaults to
  const target: ComposerTarget = { roomId, threadRootRowKey: "" };
  const userId = getMockSession().user.id;
  const message = "message";
  const updatedMessage = "updatedMessage";
  const filename = "filename";
  const mimetype = "text/plain";
  const size = 1;
  const createFile = () => new File([message], filename, { type: mimetype });

  beforeAll(() => {
    router = useRouter();
  });

  // The store reads only `session.value.data.user.id`, so signing in is that slice of the session ref
  const signIn = () => {
    useSessionMock.mockReturnValue(ref<MockSessionValue>({ data: { user: { id: userId } } }));
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    router.currentRoute.value.params.id = roomId;
    useSessionMock.mockReturnValue(ref<MockSessionValue>({ data: undefined }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("createMessage rolls back the optimistic message when the Create hook rejects", async () => {
    expect.hasAssertions();

    signIn();
    const dataStore = useDataStore();
    const { items } = storeToRefs(dataStore);
    const { createMessage } = dataStore;
    // A Create hook fetches attachment download URLs over the network; a rejection there must roll the
    // Optimistically-rendered bubble back out instead of leaving a permanent loading entity in the list.
    vi.spyOn(MessageHookMap[Operation.Create], "run").mockRejectedValueOnce(new Error(message));
    const isCreated = await createMessage({ files: [], message, replyRowKey: "", roomId, type: MessageType.Message });

    expect(isCreated).toBe(false);
    expect(items.value).toHaveLength(0);
  });

  // The mutation spans the server commit, so a rejection can equally be a lost response for a message that
  // Landed. Deleting the bubble then hides a sent message from its own sender — the subscription echo is
  // Filtered for the sending session — and invites the duplicate resend persist-then-notify exists to prevent
  test("createMessage keeps the optimistic message when the mutation rejects", async () => {
    expect.hasAssertions();

    signIn();
    const dataStore = useDataStore();
    const { items } = storeToRefs(dataStore);
    const { createMessage } = dataStore;
    server.use(
      trpcMsw.message.createMessage.mutation(() => {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message });
      }),
    );
    const isCreated = await createMessage({ files: [], message, replyRowKey: "", roomId, type: MessageType.Message });

    expect(isCreated).toBe(false);
    expect(items.value).toHaveLength(1);
  });

  // The reset clears the editor, the reply target and the composer's attachments, so the bubble is the sender's
  // Only copy of what they typed — a send that fails before the bubble exists must leave the composer alone
  test("sendMessage resets the composer only once the optimistic message is in the list", async () => {
    expect.hasAssertions();

    signIn();
    const dataStore = useDataStore();
    const { sendMessage } = dataStore;
    vi.spyOn(MessageHookMap[Operation.Create], "run").mockRejectedValueOnce(new Error(message));
    const resetSendSpy = vi.spyOn(MessageHookMap.ResetSend, "run");
    await sendMessage({ files: [], message, replyRowKey: "", roomId, type: MessageType.Message });

    expect(resetSendSpy).not.toHaveBeenCalled();
  });

  // The reset runs behind the optimistic bubble, so a room switch — or another thread being opened — can land
  // In between: every registration is handed the composer the send was for rather than resolving the current
  // One after the await
  test("sendMessage resets the composer the send was for", async () => {
    expect.hasAssertions();

    signIn();
    const dataStore = useDataStore();
    const { sendMessage } = dataStore;
    server.use(
      trpcMsw.message.createMessage.mutation(() =>
        createMessageEntity({ message, roomId, type: MessageType.Message, userId }),
      ),
    );
    const resetSendSpy = vi.spyOn(MessageHookMap.ResetSend, "run");
    await sendMessage({ files: [], message, replyRowKey: "", roomId, type: MessageType.Message });

    expect(resetSendSpy).toHaveBeenCalledWith(target, [], undefined);
  });

  // The composer keeps accepting Enter for the whole round trip, so the attachments a send took leave it at the
  // Bubble — a composer that still offers them posts a second message naming the same blobs, and deleting
  // Either message then reclaims blobs the other still renders
  test("holds the attachments a send took out of the composer until the server answers", async () => {
    expect.hasAssertions();

    signIn();
    const dataStore = useDataStore();
    const uploadFileStore = useUploadFileStore();
    const { sendMessage } = dataStore;
    const { getComposerFiles } = uploadFileStore;
    vi.spyOn(URL, "createObjectURL").mockReturnValue("");
    vi.spyOn(URL, "revokeObjectURL").mockReturnValue();
    const sentFileId = crypto.randomUUID();
    let heldFileIds: string[] = [];
    server.use(
      trpcMsw.message.createMessage.mutation(() => {
        heldFileIds = getComposerFiles(target).map(({ id }) => id);
        return createMessageEntity({ message, roomId, type: MessageType.Message, userId });
      }),
    );
    uploadFileStore.storeUploadFiles(target, [{ file: createFile(), id: sentFileId, token: "" }]);
    await sendMessage({
      files: [{ filename, hasThumbnail: false, id: sentFileId, mimetype, size }],
      message,
      replyRowKey: "",
      roomId,
      type: MessageType.Message,
    });

    expect(heldFileIds).toStrictEqual([]);
  });

  // Held rather than discarded, because the upload grant that came off with the row is the only thing that can
  // Reclaim its blob — so a rejection hands the attachment back for the retry instead of stranding it
  test("hands the composer's attachments back when the server rejects the send", async () => {
    expect.hasAssertions();

    signIn();
    const dataStore = useDataStore();
    const uploadFileStore = useUploadFileStore();
    const { sendMessage } = dataStore;
    const { getComposerFiles } = uploadFileStore;
    vi.spyOn(URL, "createObjectURL").mockReturnValue("");
    vi.spyOn(URL, "revokeObjectURL").mockReturnValue();
    const sentFileId = crypto.randomUUID();
    server.use(
      trpcMsw.message.createMessage.mutation(() => {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message });
      }),
    );
    uploadFileStore.storeUploadFiles(target, [{ file: createFile(), id: sentFileId, token: "" }]);
    await sendMessage({
      files: [{ filename, hasThumbnail: false, id: sentFileId, mimetype, size }],
      message,
      replyRowKey: "",
      roomId,
      type: MessageType.Message,
    });

    expect(getComposerFiles(target).map(({ id }) => id)).toStrictEqual([sentFileId]);
  });

  // The composer's attachments carry the only grants that authorize reclaiming their blobs, so a send the server
  // Rejects must leave them in place — released at the bubble, the blobs are referenced by no message and
  // Reclaimable by nothing, and the user re-picks every attachment to try again
  test("createMessage releases the composer's attachments only once the server accepts", async () => {
    expect.hasAssertions();

    signIn();
    const dataStore = useDataStore();
    const { createMessage } = dataStore;
    server.use(
      trpcMsw.message.createMessage.mutation(() => {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message });
      }),
    );
    const commitSendSpy = vi.spyOn(MessageHookMap.CommitSend, "run");
    await createMessage({ files: [], message, replyRowKey: "", roomId, type: MessageType.Message });

    expect(commitSendSpy).not.toHaveBeenCalled();
  });

  test("createMessage releases the composer's attachments for the composer the send was for", async () => {
    expect.hasAssertions();

    signIn();
    const dataStore = useDataStore();
    const { createMessage } = dataStore;
    server.use(
      trpcMsw.message.createMessage.mutation(() =>
        createMessageEntity({ message, roomId, type: MessageType.Message, userId }),
      ),
    );
    const commitSendSpy = vi.spyOn(MessageHookMap.CommitSend, "run");
    await createMessage({ files: [], message, replyRowKey: "", roomId, type: MessageType.Message });

    expect(commitSendSpy).toHaveBeenCalledWith(target, []);
  });

  // The commit runs behind the send, so the composer keeps taking uploads for the whole round trip. Releasing
  // Whatever it holds once the server answers takes the attachment the user picked for their NEXT message with
  // It — and removal is not a discard, so that blob loses the only grant that could ever reclaim it
  test("createMessage releases only the attachments the accepted message persisted", async () => {
    expect.hasAssertions();

    signIn();
    const dataStore = useDataStore();
    const uploadFileStore = useUploadFileStore();
    const { createMessage } = dataStore;
    const { getComposerFiles } = uploadFileStore;
    server.use(
      trpcMsw.message.createMessage.mutation(() =>
        createMessageEntity({ message, roomId, type: MessageType.Message, userId }),
      ),
    );
    // The preview url the composer mints per attachment is incidental here, and the environment's
    // `createObjectURL` rejects the runtime's own `File` on an instanceof check
    vi.spyOn(URL, "createObjectURL").mockReturnValue("");
    vi.spyOn(URL, "revokeObjectURL").mockReturnValue();
    const sentFileId = crypto.randomUUID();
    const nextFileId = crypto.randomUUID();
    uploadFileStore.storeUploadFiles(target, [{ file: createFile(), id: sentFileId, token: "" }]);
    const createPromise = createMessage({
      files: [{ filename, hasThumbnail: false, id: sentFileId, mimetype, size }],
      message,
      replyRowKey: "",
      roomId,
      type: MessageType.Message,
    });
    uploadFileStore.storeUploadFiles(target, [{ file: createFile(), id: nextFileId, token: "" }]);

    await expect(createPromise).resolves.toBe(true);
    expect(getComposerFiles(target).map(({ id }) => id)).toStrictEqual([nextFileId]);
  });

  // The wire payload and the ids handed to the commit come from one snapshot, so an upload that lands mid-flight
  // Is in neither. Serialized into the payload but absent from the commit, it would stay in the composer and
  // Ride along with the next send too — one blob referenced by two messages
  test("sends only the attachments the composer held when the send started", async () => {
    expect.hasAssertions();

    signIn();
    const dataStore = useDataStore();
    const uploadFileStore = useUploadFileStore();
    const { createMessage } = dataStore;
    vi.spyOn(URL, "createObjectURL").mockReturnValue("");
    vi.spyOn(URL, "revokeObjectURL").mockReturnValue();
    const sentFileId = crypto.randomUUID();
    const nextFileId = crypto.randomUUID();
    let payloadFileIds: string[] = [];
    server.use(
      trpcMsw.message.createMessage.mutation(({ input }) => {
        payloadFileIds = input.files?.map(({ id }) => id) ?? [];
        return createMessageEntity({ message, roomId, type: MessageType.Message, userId });
      }),
    );
    uploadFileStore.storeUploadFiles(target, [{ file: createFile(), id: sentFileId, token: "" }]);
    const createPromise = createMessage({
      files: uploadFileStore.getComposerFiles(target),
      message,
      replyRowKey: "",
      roomId,
      type: MessageType.Message,
    });
    uploadFileStore.storeUploadFiles(target, [{ file: createFile(), id: nextFileId, token: "" }]);
    await createPromise;

    expect(payloadFileIds).toStrictEqual([sentFileId]);
  });

  // A successful create also mirrors the server's thread auto-follow, so the reply's root is followed locally
  // Without the round trip the drawer would otherwise need
  test("createMessage mirrors the thread auto-follow of a reply", async () => {
    expect.hasAssertions();

    signIn();
    const dataStore = useDataStore();
    const threadFollowStore = useThreadFollowStore();
    const { checkIsFollowing } = threadFollowStore;
    const { createMessage } = dataStore;
    const replyRowKey = crypto.randomUUID();
    server.use(
      trpcMsw.message.createMessage.mutation(() =>
        createMessageEntity({ message, roomId, type: MessageType.Message, userId }),
      ),
    );
    const isCreated = await createMessage({ files: [], message, replyRowKey, roomId, type: MessageType.Message });

    expect(isCreated).toBe(true);
    expect(checkIsFollowing(roomId, replyRowKey)).toBe(true);
  });

  // The newer-cursor pages the room-keyed list, so it is keyed the same way. Held globally it survives the room
  // Switch, and the next room renders a "load newer" waypoint it never earned, then pages in a window cut from
  // The previous room's timestamps
  test("keeps the newer-message cursor with the room it was read for", () => {
    expect.hasAssertions();

    const otherRoomId = crypto.randomUUID();
    const dataStore = useDataStore();
    const { hasMoreNewer, nextCursorNewer } = storeToRefs(dataStore);
    const { getHasMoreNewerRef, getNextCursorNewerRef } = dataStore;
    getHasMoreNewerRef(roomId).value = true;
    getNextCursorNewerRef(roomId).value = message;
    // Replaced rather than mutated in place: the route is a shallow ref, so only a new value re-runs the
    // Computed the room-keyed slices resolve their key through
    router.currentRoute.value = { ...router.currentRoute.value, params: { id: otherRoomId } };

    expect(hasMoreNewer.value).toBe(false);
    expect(nextCursorNewer.value).toBe("");

    router.currentRoute.value = { ...router.currentRoute.value, params: { id: roomId } };

    expect(hasMoreNewer.value).toBe(true);
    expect(nextCursorNewer.value).toBe(message);
  });

  // Only the sender's own message renders ahead of its hooks — it has a loading bubble to keep responsive and a
  // Rollback if they reject. A message from anyone else waits, or every incoming attachment renders broken until
  // Its url fetch lands
  test("withholds a message from another member until its Create hooks resolve", async () => {
    expect.hasAssertions();

    const dataStore = useDataStore();
    const { items } = storeToRefs(dataStore);
    const { storeCreateMessage } = dataStore;
    const newMessage = createMessageEntity({
      message,
      roomId,
      type: MessageType.Message,
      userId: crypto.randomUUID(),
    });
    vi.spyOn(MessageHookMap[Operation.Create], "run").mockResolvedValue();
    const storePromise = storeCreateMessage(newMessage);

    // Synchronously after the call the hooks are still pending, so nothing may have been pushed yet
    expect(items.value).toHaveLength(0);

    await storePromise;

    expect(items.value).toHaveLength(1);
  });

  // Both edits name the same message, so the second runs behind the first and applies on top of what it stored.
  // A body captured when the caller invoked it — before the write ahead of it had even been sent — unwinds the
  // Bubble past that write, back to text the user replaced two edits ago
  test("rolls a queued edit back to the body the edit ahead of it stored", async () => {
    expect.hasAssertions();

    const rejectedMessage = "rejectedMessage";
    server.use(
      trpcMsw.message.updateMessage.mutation(({ input }) => {
        if (input.message === rejectedMessage) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message });
      }),
    );
    const dataStore = useDataStore();
    const { items } = storeToRefs(dataStore);
    const { getSlice, updateMessage } = dataStore;
    const newMessage = createMessageEntity({
      message,
      roomId,
      type: MessageType.Message,
      userId: getMockSession().user.id,
    });
    getSlice(newMessage.partitionKey).items.value = [newMessage];
    const compositeKey = { partitionKey: newMessage.partitionKey, rowKey: newMessage.rowKey };
    await Promise.all([
      updateMessage({ ...compositeKey, message: updatedMessage }),
      updateMessage({ ...compositeKey, message: rejectedMessage }),
    ]);

    expect(takeOne(items.value).message).toBe(updatedMessage);
  });

  // Each attachment is its own target, so two removals from one message overlap: reading the list the call was
  // Issued with makes the second removal write back the file the first one took off
  test("removes and restores one attachment at a time", async () => {
    expect.hasAssertions();

    const rejectedFileId = crypto.randomUUID();
    const acceptedFileId = crypto.randomUUID();
    const keptFileId = crypto.randomUUID();
    server.use(
      trpcMsw.message.deleteFile.mutation(({ input }) => {
        if (input.id === rejectedFileId) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message });
      }),
    );
    const dataStore = useDataStore();
    const { items } = storeToRefs(dataStore);
    const { deleteFile, getSlice } = dataStore;
    const newMessage = createMessageEntity({
      files: [acceptedFileId, rejectedFileId, keptFileId].map((id) => ({
        filename,
        hasThumbnail: false,
        id,
        mimetype,
        size,
      })),
      message,
      roomId,
      type: MessageType.Message,
      userId: getMockSession().user.id,
    });
    getSlice(newMessage.partitionKey).items.value = [newMessage];
    const compositeKey = { partitionKey: newMessage.partitionKey, rowKey: newMessage.rowKey };
    await Promise.all([
      deleteFile({ ...compositeKey, id: acceptedFileId }),
      deleteFile({ ...compositeKey, id: rejectedFileId }),
    ]);

    expect(takeOne(items.value).files.map(({ id }) => id)).toStrictEqual([keptFileId, rejectedFileId]);
  });

  test("storeUpdateMessage is idempotent", async () => {
    expect.hasAssertions();

    const dataStore = useDataStore();
    const { items } = storeToRefs(dataStore);
    const { storeCreateMessage, storeUpdateMessage } = dataStore;
    const newMessage = createMessageEntity({
      message,
      roomId,
      type: MessageType.Message,
      userId: getMockSession().user.id,
    });
    await storeCreateMessage(newMessage);
    const updatedInput = { message: updatedMessage, partitionKey: newMessage.partitionKey, rowKey: newMessage.rowKey };
    await storeUpdateMessage(updatedInput);
    await storeUpdateMessage(updatedInput);

    expect(items.value).toHaveLength(1);
    expect(takeOne(items.value).message).toBe(updatedMessage);
  });
});
