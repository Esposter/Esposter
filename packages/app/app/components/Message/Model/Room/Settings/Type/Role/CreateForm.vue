<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { createRoleInputSchema } from "#shared/models/db/role/CreateRoleInput";
import { useRoleStore } from "@/store/message/room/role";

interface Props {
  roomId: RoomInMessage["id"];
}

const { roomId } = defineProps<Props>();
const roleStore = useRoleStore();
const { createRole } = roleStore;
const name = ref("");
const submit = async () => {
  await createRole({ name: name.value, permissions: 0n, position: 0, roomId });
  name.value = "";
};
</script>

<!-- Discord creates a placeholder role and has you rename it in the editor. Named here instead: a role's name is
     the whole of it at creation, and one that exists before it has one shows up in every member's role list as
     "new role" until someone finishes the job -->
<template>
  <div>
    <v-text-field v-model="name" density="compact" placeholder="Create role..." @keyup.enter="submit()">
      <template #append-inner>
        <StyledTooltipIconButton
          :button-props="{
            disabled: !createRoleInputSchema.shape.name.safeParse(name).success,
            size: 'x-small',
            variant: 'plain',
          }"
          icon="mdi-plus"
          text="Create role"
          @click="submit()"
        />
      </template>
    </v-text-field>
  </div>
</template>
