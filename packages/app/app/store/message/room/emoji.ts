import type { CreateRoomEmojiInput } from "#shared/models/db/roomEmoji/CreateRoomEmojiInput";
import type { DeleteRoomEmojiInput } from "#shared/models/db/roomEmoji/DeleteRoomEmojiInput";
import type { UpdateRoomEmojiInput } from "#shared/models/db/roomEmoji/UpdateRoomEmojiInput";
import type { RoomEmojiWithSasUrl } from "#shared/models/message/emoji/RoomEmojiWithSasUrl";
import type { CustomEmoji } from "@/models/message/emoji/CustomEmoji";
import type { RoomInMessage } from "@esposter/db-schema";
import type { Except } from "type-fest";

import { useMutation } from "@/composables/shared/useMutation";
import { EmojiType } from "@/models/message/emoji/EmojiType";
import { getSingleFileSasEntities } from "@/services/file/getSingleFileSasEntities";
import { uploadFileToSas } from "@/services/file/uploadFileToSas";
import { createOperationData } from "@/services/shared/createOperationData";
import { useRoomStore } from "@/store/message/room";
import { DatabaseEntityType } from "@esposter/db-schema";

export const useRoomEmojiStore = defineStore("message/room/emoji", () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { checkIsRoomScoped } = roomStore;
  const { items, ...restData } = useCursorPaginationDataMap<RoomEmojiWithSasUrl>(() => roomStore.scopedRoomId);
  const {
    createRoomEmoji: storeCreateRoomEmoji,
    deleteRoomEmoji: storeDeleteRoomEmoji,
    updateRoomEmoji: storeUpdateRoomEmoji,
    ...restOperationData
  } = createOperationData(items, ["id"], DatabaseEntityType.RoomEmoji);
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
        if (!checkIsRoomScoped(roomId)) return;

        items.value = roomEmojis;
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
        // Server-minted id, so there is no natural entity key — overlapping uploads must never queue behind
        // Each other while their images are still writing
        key: Symbol("createRoomEmoji"),
        onSuccess: (newRoomEmoji) => {
          if (checkIsRoomScoped(roomId)) storeCreateRoomEmoji(newRoomEmoji);
        },
      },
    );
  };
  const updateRoomEmoji = async (roomId: RoomInMessage["id"], input: Except<UpdateRoomEmojiInput, "roomId">) => {
    await executeUpdateRoomEmojiMutation(() => $trpc.room.emoji.updateRoomEmoji.mutate({ ...input, roomId }), {
      // Snapshot when the write is sent rather than when it was issued, and only this row: the same list is
      // Appended to by the room's own subscription, which a whole-list restore would undo
      applyOptimistic: () => {
        const previousRoomEmoji = items.value.find(({ id }) => id === input.id);
        const previousName = previousRoomEmoji ? { id: previousRoomEmoji.id, name: previousRoomEmoji.name } : undefined;
        storeUpdateRoomEmoji(input);
        return () => {
          if (previousName && checkIsRoomScoped(roomId)) storeUpdateRoomEmoji(previousName);
        };
      },
      key: input.id,
      onSuccess: (updatedRoomEmoji) => {
        if (checkIsRoomScoped(roomId)) storeUpdateRoomEmoji(updatedRoomEmoji);
      },
    });
  };
  const deleteRoomEmoji = async (roomId: RoomInMessage["id"], input: Except<DeleteRoomEmojiInput, "roomId">) => {
    await executeDeleteRoomEmojiMutation(() => $trpc.room.emoji.deleteRoomEmoji.mutate({ ...input, roomId }), {
      // Put back only this row, at the position it held — reinstating a whole-list snapshot would resurrect an
      // Emoji another deletion already removed
      applyOptimistic: () => {
        const deletedIndex = items.value.findIndex(({ id }) => id === input.id);
        const deletedRoomEmoji = items.value[deletedIndex];
        storeDeleteRoomEmoji({ id: input.id });
        return () => {
          if (!deletedRoomEmoji || !checkIsRoomScoped(roomId)) return;

          items.value = items.value.toSpliced(Math.min(deletedIndex, items.value.length), 0, deletedRoomEmoji);
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
    items,
    readRoomEmojis,
    storeCreateRoomEmoji,
    storeDeleteRoomEmoji,
    storeUpdateRoomEmoji,
    updateRoomEmoji,
    ...restData,
    ...restOperationData,
  };
});
