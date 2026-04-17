<script setup lang="ts">
import type { Room } from "@esposter/db-schema";

import { useRoleStore } from "@/store/message/room/role";

interface CreateRoleIndexProps {
  roomId: Room["id"];
}

const emit = defineEmits<{ created: [] }>();
const { roomId } = defineProps<CreateRoleIndexProps>();
const roleStore = useRoleStore();
const { createRole } = roleStore;
const name = ref("");

const submit = async () => {
  const trimmedName = name.value.trim();
  if (!trimmedName) return;
  await createRole({ name: trimmedName, permissions: 0n, position: 0, roomId });
  name.value = "";
  emit("created");
};
</script>

<template>
  <div flex flex-col gap-y-4 max-w-md>
    <v-text-field v-model="name" label="Role name" density="compact" hide-details @keyup.enter="submit" />
    <div>
      <v-btn :disabled="!name.trim()" color="primary" @click="submit">Create Role</v-btn>
    </div>
  </div>
</template>
