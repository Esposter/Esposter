import type { CreateRoomEmojiInput } from "#shared/models/db/roomEmoji/CreateRoomEmojiInput";
import type { DeleteRoomEmojiInput } from "#shared/models/db/roomEmoji/DeleteRoomEmojiInput";
import type { UpdateRoomEmojiInput } from "#shared/models/db/roomEmoji/UpdateRoomEmojiInput";
import type { CustomEmoji } from "#src/models/message/emoji/CustomEmoji";
import type { RoomEmojiWithPresignedUrl, RoomInMessage } from "@esposter/db-schema";
import type { Except } from "type-fest";

import { EmojiType } from "#src/models/message/emoji/EmojiType";
import { getSingleFilePresignedUrlEntities } from "#src/services/file/getSingleFilePresignedUrlEntities";
import { uploadFilesToPresignedUrls } from "#src/services/file/uploadFilesToPresignedUrls";
import { roomEmojiTable } from "#src/services/message/room/overlay/constants";
import { getRoomEmojiPatchEntry } from "#src/services/message/room/overlay/getRoomEmojiPatchEntry";
import { checkIsVersioned } from "#src/services/shared/overlay/checkIsVersioned";
import { createArrival } from "#src/services/shared/overlay/createArrival";
import { createRowResponse } from "#src/services/shared/overlay/createRowResponse";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useRoomStore } from "#src/store/message/room/index";
import { useOverlayStore } from "#src/store/overlay";

export const useRoomEmojiStore = defineStore("message/room/emoji", () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const overlayStore = useOverlayStore();
  const { view, writeAwaited, writeOptimistic } = overlayStore;
  const roomEmojiRows = view(roomEmojiTable);
  // The room the screen is scoped to, with its live emoji. The view leaves a deleted emoji's tombstone out
  const items = computed(() =>
    roomEmojiRows.value.filter(
      (roomEmoji): roomEmoji is RoomEmojiWithPresignedUrl =>
        roomEmoji.roomId === roomStore.scopedRoomId && checkIsVersioned(roomEmoji),
    ),
  );
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
  const readRoomEmojiRows = useOverlayRead(roomEmojiTable, (roomEmoji: RoomEmojiWithPresignedUrl) => roomEmoji);
  // The room's set with its tombstones, so a removal the answer names reaches the emoji the room's subscription missed
  const readRoomEmojis = (roomId: RoomInMessage["id"]) =>
    readRoomEmojiRows(() => $trpc.room.emoji.readRoomEmojis.query({ roomId }));
  // Three steps in one action, because the row may only ever name a blob that landed: mint the write target,
  // Put the image there, then create the row that names it. A failure before the last step leaves a blob no row
  // Reaches, under the `{roomId}/…` prefix the room's own teardown sweeps
  const createRoomEmoji = async (input: Except<CreateRoomEmojiInput, "id">, file: File) => {
    // Whether the server kept it, so the dialog that asked stays open over a refusal
    let isCreated = false;
    await writeAwaited(
      async () => {
        const { id, presignedUrl } = await $trpc.room.emoji.generateUploadRoomEmojiPresignedUrlEntity.query({
          mimetype: file.type,
          roomId: input.roomId,
          size: file.size,
        });
        await uploadFilesToPresignedUrls({
          files: [file],
          generateUploadFilePresignedUrlEntities: getSingleFilePresignedUrlEntities(presignedUrl),
        });
        const roomEmoji = await $trpc.room.emoji.createRoomEmoji.mutate({ ...input, id });
        isCreated = true;
        return [createArrival(roomEmojiTable, roomEmoji)];
      },
      { onError: createErrorAlert },
    );
    return isCreated;
  };
  const updateRoomEmoji = (input: UpdateRoomEmojiInput) => {
    writeOptimistic(
      async () => createRowResponse(roomEmojiTable, await $trpc.room.emoji.updateRoomEmoji.mutate(input)),
      { entry: getRoomEmojiPatchEntry(input.id, { name: input.name }), onError: createErrorAlert },
    );
  };
  const deleteRoomEmoji = (input: DeleteRoomEmojiInput) => {
    writeOptimistic(
      async () => createRowResponse(roomEmojiTable, await $trpc.room.emoji.deleteRoomEmoji.mutate(input)),
      { entry: getRoomEmojiPatchEntry(input.id, { deletedAt: new Date() }), onError: createErrorAlert },
    );
  };
  return { createRoomEmoji, customEmojiMap, customEmojis, deleteRoomEmoji, items, readRoomEmojis, updateRoomEmoji };
});
