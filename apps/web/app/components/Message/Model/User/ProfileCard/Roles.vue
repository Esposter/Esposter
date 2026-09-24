<script setup lang="ts">
import type { RoomInMessage, User } from "@esposter/db-schema";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useRoleStore } from "@/store/message/room/role";
import { RoomPermission } from "@esposter/db-schema";

interface Props {
  roomId: RoomInMessage["id"];
  userId: User["id"];
}

const { roomId, userId } = defineProps<Props>();
const roleStore = useRoleStore();
const { checkHasMyPermission, getMemberRoles, getRoles } = roleStore;
const memberRoles = computed(() =>
  getMemberRoles(roomId, userId)
    .filter(({ isEveryone }) => !isEveryone)
    .toSorted((firstRole, secondRole) => secondRole.position - firstRole.position),
);
const assignableRoles = computed(() => getRoles(roomId).filter(({ isEveryone }) => !isEveryone));
// Discord assigns a role from the member themselves rather than only from a settings list, which is where the want
// Happens: reading who someone is is the moment you notice what they should be able to do
const isEditable = computed(
  () => checkHasMyPermission(roomId, RoomPermission.ManageRoles) && assignableRoles.value.length > 0,
);
</script>

<template>
  <section v-if="memberRoles.length > 0 || isEditable" flex flex-col gap-1>
    <div flex gap-2 items-center>
      <h3 text-sm text-muted flex-1>Roles</h3>
      <UiPopover v-if="isEditable" label="Edit roles" :variant="UiButtonVariant.Quiet" px-0>
        <template #trigger><UiIcon :meaning="UiIconMeaning.Edit" /></template>
        <div w="[min(16rem,70dvw)]" flex flex-col>
          <MessageModelRoomRoleMemberListItem v-for="role of assignableRoles" :key="role.id" :role :room-id :user-id />
        </div>
      </UiPopover>
    </div>
    <ul v-if="memberRoles.length > 0" flex flex-wrap gap-1>
      <li v-for="{ color, id, name } of memberRoles" :key="id">
        <UiChip>
          <MessageModelRoomSettingsTypeRoleColorDot aria-hidden="true" :color />
          {{ name }}
        </UiChip>
      </li>
    </ul>
    <p v-else text-sm text-muted>No roles yet.</p>
  </section>
</template>
