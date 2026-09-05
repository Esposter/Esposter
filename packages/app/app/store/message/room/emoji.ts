import type { CreateRoomEmojiInput } from "#shared/models/db/roomEmoji/CreateRoomEmojiInput";
import type { DeleteRoomEmojiInput } from "#shared/models/db/roomEmoji/DeleteRoomEmojiInput";
import type { UpdateRoomEmojiInput } from "#shared/models/db/roomEmoji/UpdateRoomEmojiInput";
import type { RoomEmojiWithSasUrl } from "#shared/models/message/emoji/RoomEmojiWithSasUrl";
import type { CustomEmoji } from "@/models/message/emoji/CustomEmoji";
import type { RoomInMessage } from "@esposter/db-schema";
import type { Except } from "type-fest";

import { EmojiType } from "@/models/message/emoji/EmojiType";
import { getSingleFileSasEntities } from "@/services/file/getSingleFileSasEntities";
import { uploadFileToSas } from "@/services/file/uploadFileToSas";
import { createOperationData } from "@/services/shared/createOperationData";
import { useRoomStore } from "@/store/message/room";
import { DatabaseEntityType } from "@esposter/db-schema";

export const useRoomEmojiStore = defineStore("message/room/emoji", () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { getSlice, items, ...restData } = useCursorPaginationDataMap<RoomEmojiWithSasUrl>(
    () => roomStore.scopedRoomId,
  );
  // `items` is the reading view — whichever room the screen is scoped to. Writing through it would file a row
  // Under whatever room is scoped when the write lands, so the write functions are only reachable by naming the
  // Room they are for: a read, a mutation and a subscription all know their room, and each names it once up front
  const getRoomOperationData = (roomId: RoomInMessage["id"]) =>
    createOperationData(getSlice(roomId).items, ["id"], DatabaseEntityType.RoomEmoji);
  const storeCreateRoomEmoji = (roomId: RoomInMessage["id"], newRoomEmoji: RoomEmojiWithSasUrl) => {
    getRoomOperationData(roomId).createRoomEmoji(newRoomEmoji);
  };
  const storeDeleteRoomEmoji = (roomId: RoomInMessage["id"], ids: { id: RoomEmojiWithSasUrl["id"] }) => {
    getRoomOperationData(roomId).deleteRoomEmoji(ids);
  };
  const storeUpdateRoomEmoji = (roomId: RoomInMessage["id"], updatedRoomEmoji: Partial<RoomEmojiWithSasUrl>) => {
    getRoomOperationData(roomId).updateRoomEmoji(updatedRoomEmoji);
  };
  // What every picking surface consumes. The name is the slug: it is already drawn from the dataset's slug
  // Charset, so search, `:` completion and the recents list treat both vocabularies identically
  const customEmojis = computed<CustomEmoji[]>(() =>
    items.value.map(({ id, name, sasUrl }) => ({ id, name, sasUrl, slug: name, type: EmojiType.Custom })),
  );
  // Keyed by id because that is what a stored reaction and a message token both name — a rename must never
  // Strand either of them
  const customEmojiMap = computed(
    () => new Map(customEmojis.value.map((customEmoji) => [customEmoji.id, customEmoji])),
  );
  const { executeQuery: executeReadRoomEmojisQuery } = useMutation();
  const readRoomEmojis = async (roomId: RoomInMessage["id"]) => {
    // Keyed by the room, so re-entering it supersedes the read it interrupted: the room lifecycle issues one read
    // Per activation, and A→B→A would otherwise let the first A response land last and overwrite the newer list
    await executeReadRoomEmojisQuery(() => $trpc.room.emoji.readRoomEmojis.query({ roomId }), {
      key: roomId,
      onSuccess: (roomEmojis) => {
        getSlice(roomId).items.value = roomEmojis;
      },
    });
  };
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
    await executeCreateRoomEmojiMutation(
      async () => {
        const { id, sasUrl } = await $trpc.room.emoji.generateUploadRoomEmojiSasEntity.query({
          mimetype: file.type,
          roomId,
          size: file.size,
        });
        await uploadFileToSas({ files: [file], generateUploadFileSasEntities: getSingleFileSasEntities(sasUrl) });
        return $trpc.room.emoji.createRoomEmoji.mutate({ id, name, roomId });
      },
      {
        key: Symbol("createRoomEmoji"),
        onSuccess: (newRoomEmoji) => {
          storeCreateRoomEmoji(roomId, newRoomEmoji);
        },
      },
    );
  };
  const updateRoomEmoji = async (roomId: RoomInMessage["id"], input: Except<UpdateRoomEmojiInput, "roomId">) => {
    await executeUpdateRoomEmojiMutation(() => $trpc.room.emoji.updateRoomEmoji.mutate({ ...input, roomId }), {
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
      onSuccess: (updatedRoomEmoji) => {
        storeUpdateRoomEmoji(roomId, updatedRoomEmoji);
      },
    });
  };
  const deleteRoomEmoji = async (roomId: RoomInMessage["id"], input: Except<DeleteRoomEmojiInput, "roomId">) => {
    await executeDeleteRoomEmojiMutation(() => $trpc.room.emoji.deleteRoomEmoji.mutate({ ...input, roomId }), {
      // Put back only this row, at the position it held
      applyOptimistic: () => {
        const { items: roomItems } = getSlice(roomId);
        const deletedIndex = roomItems.value.findIndex(({ id }) => id === input.id);
        const deletedRoomEmoji = roomItems.value[deletedIndex];
        storeDeleteRoomEmoji(roomId, { id: input.id });
        return () => {
          if (!deletedRoomEmoji) return;

          roomItems.value = roomItems.value.toSpliced(
            Math.min(deletedIndex, roomItems.value.length),
            0,
            deletedRoomEmoji,
          );
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
