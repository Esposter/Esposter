<script setup lang="ts">
import type { Room, User } from "@esposter/db-schema";

import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { useRoleStore } from "@/store/message/room/role";
import { useMemberStore } from "@/store/message/user/member";

interface CreateRoleFormProps {
  roomId: Room["id"];
}

const { roomId } = defineProps<CreateRoleFormProps>();
const roleStore = useRoleStore();
const { assignRole, createRole } = roleStore;
const { selectedRoleId } = storeToRefs(roleStore);
const memberStore = useMemberStore();
const { hasMore, members } = storeToRefs(memberStore);
const { readMembers, readMoreMembers } = useReadMembers();
const selectedMember = ref<User | null>(null);
const searchText = ref("");

onMounted(() => {
  readMembers();
});

const onSelectMember = async (member: User | null) => {
  if (!member || !selectedRoleId.value) return;
  await assignRole({ roleId: selectedRoleId.value, roomId, userId: member.id });
  await nextTick();
  selectedMember.value = null;
  searchText.value = "";
};

const createNewRole = async () => {
  const name = searchText.value.trim();
  if (!name) return;
  searchText.value = "";
  await createRole({ name, permissions: 0n, position: 0, roomId });
};
</script>

<template>
  <div flex items-center gap-x-2 mb-3>
    <v-autocomplete
      v-model="selectedMember"
      v-model:search="searchText"
      :items="members"
      item-title="name"
      item-value="id"
      placeholder="Add role or member..."
      density="compact"
      hide-details
      return-object
      no-filter
      flex-1
      @update:model-value="onSelectMember"
    >
      <template #item="{ item, props: itemProps }">
        <v-list-item :="itemProps">
          <template #prepend>
            <StyledAvatar :image="item.raw.image" :name="item.raw.name" size="24" />
          </template>
          <template #append>
            <span text-xs text-medium-emphasis>Member</span>
          </template>
        </v-list-item>
      </template>
      <template #append-item>
        <StyledWaypoint :is-active="hasMore" @change="readMoreMembers">
          <MessageModelMemberSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
        </StyledWaypoint>
      </template>
    </v-autocomplete>
    <v-tooltip text="Create role">
      <template #activator="{ props }">
        <v-btn
          :="props"
          :disabled="!searchText.trim()"
          density="compact"
          icon="mdi-plus"
          variant="tonal"
          @click="createNewRole"
        />
      </template>
    </v-tooltip>
  </div>
</template>
