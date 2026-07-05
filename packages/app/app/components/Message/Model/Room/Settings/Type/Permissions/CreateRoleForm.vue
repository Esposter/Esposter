<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { createRoleInputSchema } from "#shared/models/db/role/CreateRoleInput";
import { useRoleStore } from "@/store/message/room/role";

interface CreateRoleFormProps {
  roomId: RoomInMessage["id"];
}

const { roomId } = defineProps<CreateRoleFormProps>();
const roleStore = useRoleStore();
const { createRole } = roleStore;
const name = ref("");
const submit = async () => {
  await createRole({ name: name.value, permissions: 0n, position: 0, roomId });
  name.value = "";
};
</script>

<template>
  <v-text-field v-model="name" label="New role name" density="compact" hide-details @keyup.enter="submit()">
    <template #append-inner>
      <StyledTooltipIconButton
        :button-props="{
          density: 'compact',
          disabled: !createRoleInputSchema.shape.name.safeParse(name).success,
          size: 'small',
          variant: 'plain',
        }"
        icon="mdi-plus"
        text="Create role"
        @click="submit()"
      />
    </template>
  </v-text-field>
</template>
