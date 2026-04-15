<script setup lang="ts">
import type { Room } from "@esposter/db-schema";

import { useRoleStore } from "@/store/message/room/role";

interface CreateRoleFormProps {
  roomId: Room["id"];
}

const { roomId } = defineProps<CreateRoleFormProps>();
const emit = defineEmits<{ "create:role": [] }>();
const roleStore = useRoleStore();
const { createRole } = roleStore;
const name = ref("");
const submit = async () => {
  const nameValue = name.value;
  name.value = "";
  await createRole({ name: nameValue, permissions: 0n, position: 0, roomId });
  emit("create:role");
};
</script>

<template>
  <v-row no-gutters mb-3>
    <v-col>
      <v-text-field v-model="name" label="Role name" density="compact" hide-details />
    </v-col>
    <v-col ml-2>
      <v-tooltip text="Add Role">
        <template #activator="{ props }">
          <v-btn :="props" :disabled="!name" density="compact" icon="mdi-plus" variant="tonal" @click="submit()" />
        </template>
      </v-tooltip>
    </v-col>
  </v-row>
</template>
