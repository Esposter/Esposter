<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiTextFieldType } from "@/models/ui/UiTextFieldType";

interface Props {
  room: RoomInMessage;
}

const { room } = defineProps<Props>();
const { hasMore, isPending, items, readMoreBans, searchQuery } = useReadBans(room.id);
</script>

<template>
  <div py-4 flex flex-col gap-4 ui-body>
    <UiTextField v-model="searchQuery" label="Search bans" :type="UiTextFieldType.Search" />
    <!-- A ban row's own shape while a search is out: the picture, the name and when it happened -->
    <div v-if="isPending" flex flex-col>
      <div v-for="index of DEFAULT_READ_LIMIT" :key="index" ui-row>
        <UiSkeleton shrink-0 size-6 />
        <UiSkeleton h-4 w="1/4" />
        <UiSkeleton h-4 w="1/3" />
      </div>
    </div>
    <UiEmptyState
      v-else-if="items.length === 0"
      :meaning="UiIconMeaning.Person"
      :title="searchQuery ? 'No banned user goes by that name.' : 'No banned users.'"
    />
    <div v-else role="list" aria-label="Bans" flex flex-col>
      <MessageModelRoomSettingsTypeBansListItem v-for="ban of items" :key="ban.userId" :ban />
      <StyledWaypoint :is-active="hasMore" @change="(onComplete) => readMoreBans(onComplete)" />
    </div>
    <MessageModelRoomSettingsTypeBansConfirmUnbanDialog />
  </div>
</template>
