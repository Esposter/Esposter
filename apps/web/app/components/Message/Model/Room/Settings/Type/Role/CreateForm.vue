<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { createRoleInputSchema } from "#shared/models/db/role/CreateRoleInput";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useRoleStore } from "@/store/message/room/role";
import { useMemberStore } from "@/store/message/user/member";

interface Props {
  roomId: RoomInMessage["id"];
}

const { roomId } = defineProps<Props>();
const roleStore = useRoleStore();
const { createRole, selectMember } = roleStore;
const { isCreateRolePending } = storeToRefs(roleStore);
const memberStore = useMemberStore();
const { members } = storeToRefs(memberStore);
const name = ref("");
const submit = async () => {
  const newName = name.value;
  name.value = "";
  await createRole({ name: newName, permissions: 0n, position: 0, roomId });
};
// The members loaded into the room's list, each offered once a role-or-member pick is made from them
const memberItems = computed(() =>
  members.value.map(({ id, name: memberName }) => ({ meaning: UiIconMeaning.Person, title: memberName, value: id })),
);
</script>

<!-- Discord creates a placeholder role and has you rename it in the editor. Named here instead: a role's name is
     the whole of it at creation, and one that exists before it has one shows up in every member's role list as
     "new role" until someone finishes the job. A member is added by picking them, which opens their entry to set -->
<template>
  <UiForm flex gap-2 items-start @submit="submit()">
    <UiTextField
      v-model="name"
      is-label-hidden
      label="Add role or member"
      placeholder="Add role or member..."
      flex-1
      min-w-0
    />
    <UiIconButton
      :disabled="!createRoleInputSchema.shape.name.safeParse(name).success"
      :is-pending="isCreateRolePending"
      label="Create role"
      :meaning="UiIconMeaning.Create"
      type="submit"
      :variant="UiButtonVariant.Quiet"
    />
  </UiForm>
  <UiSelect
    :items="memberItems"
    :model-value="''"
    label="Add member"
    @update:model-value="(userId) => selectMember(userId)"
  />
</template>
