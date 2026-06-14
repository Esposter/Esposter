<script setup lang="ts" generic="TMultiple extends boolean = false">
import type { User } from "@esposter/db-schema";

import { useFriendStore } from "@/store/message/user/friend";

interface DirectMessageFriendPickerProps {
  excludedUserIds?: User["id"][];
  isMultiple?: TMultiple;
}

type ModelValue = TMultiple extends true ? string[] : string | undefined;

const modelValue = defineModel<ModelValue>();
const { excludedUserIds = [], isMultiple } = defineProps<DirectMessageFriendPickerProps>();
const friendStore = useFriendStore();
const { friends } = storeToRefs(friendStore);
const search = ref("");
const excludedUserIdSet = computed(() => new Set(excludedUserIds));
const displayFriends = computed(() =>
  friends.value.filter(
    ({ id, name }) =>
      !excludedUserIdSet.value.has(id) && (!search.value || name.toLowerCase().includes(search.value.toLowerCase())),
  ),
);

const reset = () => {
  search.value = "";
};

defineExpose({ reset });

const { readFriends } = useReadFriends();
await readFriends();
</script>

<template>
  <v-container>
    <v-text-field v-model="search" placeholder="Search friends" autofocus clearable hide-details />
    <v-list overflow-y-auto lines="two" max-height="360">
      <v-list-item
        v-for="{ id, image, name } of displayFriends"
        :key="id"
        :title="name"
        @click="
          isMultiple
            ? (modelValue = (
                (modelValue as string[] | undefined)?.includes(id)
                  ? (modelValue as string[]).filter((userId: string) => userId !== id)
                  : [...((modelValue as string[] | undefined) ?? []), id]
              ) as ModelValue)
            : (modelValue = (modelValue === id ? undefined : id) as ModelValue)
        "
      >
        <template #prepend>
          <StyledAvatar mr-3 :image :name :avatar-props="{ size: '2.25rem' }" />
        </template>
        <template #append>
          <v-checkbox-btn
            :model-value="
              isMultiple ? ((modelValue as string[] | undefined)?.includes(id) ?? false) : modelValue === id
            "
          />
        </template>
      </v-list-item>
      <v-list-item v-if="displayFriends.length === 0" title="No friends found" />
    </v-list>
  </v-container>
</template>
