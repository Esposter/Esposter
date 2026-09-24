<script setup lang="ts">
import type { UiSelectItem } from "@/models/ui/UiSelectItem";
import type { AdminActionType } from "@esposter/db-schema";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { AdminActionIconMap } from "@/services/message/moderation/AdminActionIconMap";
import { useMemberStore } from "@/store/message/user/member";
import { AdminActionTypes } from "@esposter/db-schema";

const type = defineModel<"" | AdminActionType>("type", { default: "", required: true });
const actorUserId = defineModel<string>("actorUserId", { default: "", required: true });
const targetUserId = defineModel<string>("targetUserId", { default: "", required: true });
const emit = defineEmits<{ update: [] }>();
const memberStore = useMemberStore();
const { members } = storeToRefs(memberStore);
const typeItems: UiSelectItem<"" | AdminActionType>[] = [
  { meaning: UiIconMeaning.Filter, title: "All actions", value: "" },
  ...AdminActionTypes.map((adminActionType) => ({
    icon: AdminActionIconMap[adminActionType],
    title: adminActionType,
    value: adminActionType,
  })),
];
const memberItems = computed<UiSelectItem<string>[]>(() => [
  { meaning: UiIconMeaning.Group, title: "All members", value: "" },
  ...members.value.map(({ id, image, name }) => ({ image, title: name, value: id })),
]);
</script>

<template>
  <div gap-2 grid cols-1 sm:cols-3>
    <div flex flex-col gap-1 min-w-0>
      <span text-sm text-muted>Action</span>
      <UiSelect v-model="type" :items="typeItems" label="Action" @update:model-value="emit('update')" />
    </div>
    <div flex flex-col gap-1 min-w-0>
      <span text-sm text-muted>Actor</span>
      <UiSelect v-model="actorUserId" :items="memberItems" label="Actor" @update:model-value="emit('update')" />
    </div>
    <div flex flex-col gap-1 min-w-0>
      <span text-sm text-muted>Target</span>
      <UiSelect v-model="targetUserId" :items="memberItems" label="Target" @update:model-value="emit('update')" />
    </div>
  </div>
</template>
