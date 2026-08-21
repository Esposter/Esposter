<script setup lang="ts">
import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";
import type { AdminActionType } from "@esposter/db-schema";

import { AdminActionTypeSelectItems } from "@/services/message/moderation/AdminActionTypeSelectItems";
import { useMemberStore } from "@/store/message/user/member";

const type = defineModel<"" | AdminActionType>("type", { default: "", required: true });
const actorUserId = defineModel<string>("actorUserId", { default: "", required: true });
const targetUserId = defineModel<string>("targetUserId", { default: "", required: true });
const emit = defineEmits<{ update: [] }>();
const memberStore = useMemberStore();
const { members } = storeToRefs(memberStore);
// "" = unfiltered ("All …") — clearable is avoided since it emits null
const memberItems = computed<SelectItemCategoryDefinition<string>[]>(() => [
  { title: "All members", value: "" },
  ...members.value.map(({ id, name }) => ({ title: name, value: id })),
]);
</script>

<template>
  <div flex gap-2>
    <v-select
      v-model="type"
      label="Action"
      :items="AdminActionTypeSelectItems"
      density="compact"
      @update:model-value="emit('update')"
    />
    <v-select
      v-model="actorUserId"
      label="Actor"
      :items="memberItems"
      density="compact"
      @update:model-value="emit('update')"
    />
    <v-select
      v-model="targetUserId"
      label="Target"
      :items="memberItems"
      density="compact"
      @update:model-value="emit('update')"
    />
  </div>
</template>
