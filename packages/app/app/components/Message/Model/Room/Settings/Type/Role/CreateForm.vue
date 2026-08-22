<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { createRoleInputSchema } from "#shared/models/db/role/CreateRoleInput";
import { useRoleStore } from "@/store/message/room/role";

interface CreateFormProps {
  roomId: RoomInMessage["id"];
}

const { roomId } = defineProps<CreateFormProps>();
const roleStore = useRoleStore();
const { createRole } = roleStore;
const name = ref("");
const submit = async () => {
  await createRole({ name: name.value, permissions: 0n, position: 0, roomId });
  name.value = "";
};
</script>

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
