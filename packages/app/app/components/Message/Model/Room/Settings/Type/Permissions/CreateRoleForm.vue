<script setup lang="ts">
import type { Room } from "@esposter/db-schema";

import { useRoleStore } from "@/store/message/room/role";

interface CreateRoleFormProps {
  roomId: Room["id"];
}

const { roomId } = defineProps<CreateRoleFormProps>();
const roleStore = useRoleStore();
const { createRole } = roleStore;
const name = ref("");

const submit = async () => {
  const trimmedName = name.value.trim();
  if (!trimmedName) return;
  name.value = "";
  await createRole({ name: trimmedName, permissions: 0n, position: 0, roomId });
};
</script>

<template>
  <v-text-field v-model="name" pt-2 label="New role name" density="compact" hide-details @keyup.enter="submit()">
    <template #append-inner>
      <v-btn
        :disabled="!name.trim()"
        color="primary"
        density="compact"
        icon="mdi-plus"
        size="small"
        variant="flat"
        @click="submit()"
      />
    </template>
  </v-text-field>
</template>
