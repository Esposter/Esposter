<script setup lang="ts">
import type { UiSelectItem } from "@/models/ui/UiSelectItem";
import type { RoomInMessage } from "@esposter/db-schema";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { resolveRoomCategoryId } from "@/services/message/roomCategory/resolveRoomCategoryId";
import { prependNoneSelectItem } from "@/services/ui/prependNoneSelectItem";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";
import { useRoomCategoryStore } from "@/store/message/roomCategory";
import { selectRoomInMessageSchema } from "@esposter/db-schema";
import { noop } from "@esposter/shared";

interface Props {
  room: RoomInMessage;
}

const { room } = defineProps<Props>();
const saveRoom = useSaveRoom(() => room);
const readRoomCategories = useReadRoomCategories();
await readRoomCategories();

const roomCategoryStore = useRoomCategoryStore();
const { roomCategories } = storeToRefs(roomCategoryStore);
const userToRoomStore = useUserToRoomStore();
const { getMyUserToRoom, setMyUserToRoom } = userToRoomStore;
const { $trpc } = useNuxtApp();
const { executeMutation } = useMutation();
// The category is the reader's own, so the field holds the reader's row for this room, resolved against the categories
// The reader still has
const myCategoryId = computed(() => resolveRoomCategoryId(roomCategories.value, getMyUserToRoom(room.id)?.categoryId));
const {
  draft: editedCategoryId,
  isDirty: isCategoryDirty,
  settle: settleCategory,
} = useStoredDraft(() => myCategoryId.value);
const {
  draft: editedIsReadOnly,
  isDirty: isReadOnlyDirty,
  settle: settleReadOnly,
} = useStoredDraft(() => room.isReadOnly);
const {
  draft: editedSlowmodeMs,
  isDirty: isSlowmodeMsDirty,
  settle: settleSlowmodeMs,
} = useStoredDraft(() => room.slowmodeMs);
// The server saves a topic as its schema parses it, so an entry that parses to the stored topic is no edit
const {
  draft: editedTopic,
  isDirty: isTopicDirty,
  settle: settleTopic,
} = useStoredDraft(
  () => room.topic,
  (topic) => selectRoomInMessageSchema.shape.topic.safeParse(topic).data,
);
const categoryItems = computed<UiSelectItem<string>[]>(() =>
  prependNoneSelectItem(
    roomCategories.value.map(({ id, name }) => ({ meaning: UiIconMeaning.Folder, title: name, value: id })),
    "None (uncategorized)",
  ),
);
const isRoomDirty = computed(() => isReadOnlyDirty.value || isSlowmodeMsDirty.value || isTopicDirty.value);
// The category is written to the reader's own membership, which the room's shared row does not carry
const saveCategory = async () => {
  const categoryId = editedCategoryId.value;
  await executeMutation(() => $trpc.userToRoom.updateUserToRoom.mutate({ categoryId, roomId: room.id }), {
    applyOptimistic: () => {
      const previousUserToRoom = getMyUserToRoom(room.id);
      if (!previousUserToRoom) return noop;

      const { categoryId: previousCategoryId } = previousUserToRoom;
      setMyUserToRoom(room.id, { ...previousUserToRoom, categoryId });
      return () => {
        const currentUserToRoom = getMyUserToRoom(room.id);
        if (currentUserToRoom) setMyUserToRoom(room.id, { ...currentUserToRoom, categoryId: previousCategoryId });
      };
    },
    key: room.id,
  });
  settleCategory();
};
// Each write goes to the procedure that owns its field, and only when that field moved. The room row is sent with the
// Fields this session edited and no others, so a field another client changed since the panel opened is not written
// Back with the value this panel was opened on
const save = async () => {
  if (isRoomDirty.value) {
    await saveRoom({
      ...(isReadOnlyDirty.value && { isReadOnly: editedIsReadOnly.value }),
      ...(isSlowmodeMsDirty.value && { slowmodeMs: editedSlowmodeMs.value }),
      ...(isTopicDirty.value && { topic: editedTopic.value }),
    });
    settleReadOnly();
    settleSlowmodeMs();
    settleTopic();
  }
  if (isCategoryDirty.value) await saveCategory();
};
</script>

<!-- The panel's name is the header's, so the fields start at the top, one column across the panel -->
<template>
  <div py-4 flex flex-col gap-6 ui-body>
    <MessageModelRoomSettingsTypeOverviewCategoryField
      v-model="editedCategoryId"
      :items="categoryItems"
      @save="save()"
    />
    <MessageModelRoomSettingsTypeOverviewTopicField v-model="editedTopic" @save="save()" />
    <MessageModelRoomSettingsTypeOverviewSlowmodeField v-model="editedSlowmodeMs" @save="save()" />
    <MessageModelRoomSettingsTypeOverviewReadOnlyField v-model="editedIsReadOnly" @save="save()" />
  </div>
</template>
