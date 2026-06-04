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
  const roleName = name.value;
  name.value = "";
  await createRole({ name: roleName, permissions: 0n, position: 0, roomId });
};
</script>

<template>
  <v-text-field v-model="name" label="New role name" density="compact" hide-details @keyup.enter="submit()">
    <template #append-inner>
      <v-tooltip text="Create role">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            :disabled="!createRoleInputSchema.shape.name.safeParse(name).success"
            density="compact"
            icon="mdi-plus"
            size="small"
            variant="plain"
            :="tooltipProps"
            @click="submit()"
          />
        </template>
      </v-tooltip>
    </template>
  </v-text-field>
</template>
