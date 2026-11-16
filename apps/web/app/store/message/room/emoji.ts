import type { CreateRoomEmojiInput } from "#shared/models/db/roomEmoji/CreateRoomEmojiInput";
import type { DeleteRoomEmojiInput } from "#shared/models/db/roomEmoji/DeleteRoomEmojiInput";
import type { UpdateRoomEmojiInput } from "#shared/models/db/roomEmoji/UpdateRoomEmojiInput";
import type { CustomEmoji } from "#src/models/message/emoji/CustomEmoji";
import type { RoomEmojiWithPresignedUrl, RoomInMessage } from "@esposter/db-schema";
import type { Except } from "type-fest";

import { EmojiType } from "#src/models/message/emoji/EmojiType";
import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { MutationStatus } from "#src/models/shared/MutationStatus";
import { getSingleFilePresignedUrlEntities } from "#src/services/file/getSingleFilePresignedUrlEntities";
import { uploadFilesToPresignedUrls } from "#src/services/file/uploadFilesToPresignedUrls";
import { createOperationData } from "#src/services/shared/createOperationData";
import { getRestoredItems } from "#src/services/shared/getRestoredItems";
import { useRoomStore } from "#src/store/message/room/index";
import { DatabaseEntityType } from "@esposter/db-schema";

export const useRoomEmojiStore = defineStore("message/room/emoji", () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { getSlice, items, ...restData } = useCursorPaginationDataMap<RoomEmojiWithPresignedUrl>(
    () => roomStore.scopedRoomId,
  );
  // `items` is the reading view — whichever room the screen is scoped to. Writing through it would file a row
  // Under whatever room is scoped when the write lands, so the write functions are only reachable by naming the
  // Room they are for: a read, a mutation and a subscription all know their room, and each names it once up front
  const getRoomOperationData = (roomId: RoomInMessage["id"]) =>
    createOperationData(getSlice(roomId).items, ["id"], DatabaseEntityType.RoomEmoji);
  const { readWithReplayedPushes, recordReadingPush } = useReadingPushes<
    RoomEmojiWithPresignedUrl,
    RoomInMessage["id"]
  >();
  const storeCreateRoomEmoji = (roomId: RoomInMessage["id"], newRoomEmoji: RoomEmojiWithPresignedUrl) => {
    recordReadingPush(roomId, { item: newRoomEmoji, type: "set" });
    getRoomOperationData(roomId).createRoomEmoji(newRoomEmoji);
  };
  const storeDeleteRoomEmoji = (roomId: RoomInMessage["id"], ids: { id: RoomEmojiWithPresignedUrl["id"] }) => {
    recordReadingPush(roomId, { checkIsRemoved: (roomEmoji) => roomEmoji.id === ids.id, type: "remove" });
    getRoomOperationData(roomId).deleteRoomEmoji(ids);
  };
  const storeUpdateRoomEmoji = (
    roomId: RoomInMessage["id"],
    updatedRoomEmoji: Partial<RoomEmojiWithPresignedUrl> & Pick<RoomEmojiWithPresignedUrl, "id">,
  ) => {
    recordReadingPush(roomId, { id: updatedRoomEmoji.id, patch: updatedRoomEmoji, type: "patch" });
    getRoomOperationData(roomId).updateRoomEmoji(updatedRoomEmoji);
  };
  // What every picking surface consumes. The name is the slug: it is already drawn from the dataset's slug
  // Charset, so search, `:` completion and the recents list treat both vocabularies identically
  const customEmojis = computed<CustomEmoji[]>(() =>
    items.value.map(({ id, name, presignedUrl }) => ({ id, name, presignedUrl, slug: name, type: EmojiType.Custom })),
  );
  // Keyed by id because that is what a stored reaction and a message token both name — a rename must never
  // Strand either of them
  const customEmojiMap = computed(
    () => new Map(customEmojis.value.map((customEmoji) => [customEmoji.id, customEmoji])),
  );
  // The room's subscription has started before this read, so what lands while the read is in flight is kept.
  // Those writes are replayed over the read's answer rather than lost in the gap between the two.
  // Keyed by the room, so re-entering it supersedes the read it interrupted.
  // The room lifecycle issues one read per activation.
  // Without that supersede, A→B→A would let the first A's response land last and overwrite the newer list
  const readRoomEmojis = (roomId: RoomInMessage["id"]) =>
    readWithReplayedPushes(
      roomId,
      () => $trpc.room.emoji.readRoomEmojis.query({ roomId }),
      (roomEmojis) => {
        getSlice(roomId).items.value = roomEmojis;
      },
    );
  const { executeMutation: executeCreateRoomEmojiMutation } = useMutation();
  const { executeMutation: executeUpdateRoomEmojiMutation } = useMutation();
  const { executeMutation: executeDeleteRoomEmojiMutation } = useMutation();
  // Three steps in one action, because the row may only ever name a blob that landed: mint the write target,
  // Put the image there, then create the row that names it. A failure before the last step leaves a blob no row
  // Reaches, under the `{roomId}/…` prefix the room's own teardown sweeps
  const createRoomEmoji = async (
    roomId: RoomInMessage["id"],
    file: File,
    { name }: Except<CreateRoomEmojiInput, "id" | "roomId">,
  ) => {
    const outcome = await executeCreateRoomEmojiMutation(
      async () => {
        const { id, presignedUrl } = await $trpc.room.emoji.generateUploadRoomEmojiPresignedUrlEntity.query({
          mimetype: file.type,
          roomId,
          size: file.size,
        });
        await uploadFilesToPresignedUrls({
          files: [file],
          generateUploadFilePresignedUrlEntities: getSingleFilePresignedUrlEntities(presignedUrl),
        });
        return $trpc.room.emoji.createRoomEmoji.mutate({ id, name, roomId });
      },
      {
        // The emoji's id and the write it is uploaded to are the server's, so the emoji is drawn once the server has it
        awaitedBecause: AwaitedReason.ServerIssuedValue,
        key: Symbol("createRoomEmoji"),
        onSuccess: (newRoomEmoji) => {
          storeCreateRoomEmoji(roomId, newRoomEmoji);
        },
      },
    );
    // Whether the server kept it, so the dialog that asked stays open over a refusal
    return outcome.status === MutationStatus.Succeeded;
  };
  const updateRoomEmoji = (roomId: RoomInMessage["id"], input: Except<UpdateRoomEmojiInput, "roomId">) => {
    executeUpdateRoomEmojiMutation(() => $trpc.room.emoji.updateRoomEmoji.mutate({ ...input, roomId }), {
      // Snapshot when the write is sent rather than when it was issued, and only this row: the same list is
      // Appended to by the room's own subscription, which a whole-list restore would undo
      applyOptimistic: () => {
        const previousRoomEmoji = getSlice(roomId).items.value.find(({ id }) => id === input.id);
        const previousName = previousRoomEmoji ? { id: previousRoomEmoji.id, name: previousRoomEmoji.name } : undefined;
        storeUpdateRoomEmoji(roomId, input);
        return () => {
          if (previousName) storeUpdateRoomEmoji(roomId, previousName);
        };
      },
      key: input.id,
      reconcile: (updatedRoomEmoji) => {
        storeUpdateRoomEmoji(roomId, updatedRoomEmoji);
      },
    });
  };
  const deleteRoomEmoji = (roomId: RoomInMessage["id"], input: Except<DeleteRoomEmojiInput, "roomId">) => {
    executeDeleteRoomEmojiMutation(() => $trpc.room.emoji.deleteRoomEmoji.mutate({ ...input, roomId }), {
      applyOptimistic: () => {
        const { items: roomItems } = getSlice(roomId);
        const deletedIndex = roomItems.value.findIndex(({ id }) => id === input.id);
        const deletedRoomEmoji = roomItems.value[deletedIndex];
        storeDeleteRoomEmoji(roomId, { id: input.id });
        return () => {
          if (deletedRoomEmoji) roomItems.value = getRestoredItems(roomItems.value, deletedRoomEmoji, deletedIndex);
        };
      },
      key: input.id,
    });
  };
  return {
    createRoomEmoji,
    customEmojiMap,
    customEmojis,
    deleteRoomEmoji,
    getSlice,
    items,
    readRoomEmojis,
    storeCreateRoomEmoji,
    storeDeleteRoomEmoji,
    storeUpdateRoomEmoji,
    updateRoomEmoji,
    ...restData,
  };
});
