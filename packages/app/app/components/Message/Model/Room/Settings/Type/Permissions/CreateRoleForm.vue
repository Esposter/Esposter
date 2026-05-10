<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { useRoleStore } from "@/store/message/room/role";
import { normalizeString } from "@esposter/shared";

interface CreateRoleFormProps {
  roomId: RoomInMessage["id"];
}

const { roomId } = defineProps<CreateRoleFormProps>();
const roleStore = useRoleStore();
const { createRole } = roleStore;
const name = ref("");

const submit = async () => {
  const normalizedName = normalizeString(name.value);
  if (!normalizedName) return;
  name.value = "";
  await createRole({ name: normalizedName, permissions: 0n, position: 0, roomId });
};
</script>

<template>
  <v-text-field v-model="name" label="New role name" density="compact" hide-details @keyup.enter="submit()">
    <template #append-inner>
      <v-tooltip text="Create role">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            :disabled="!normalizeString(name)"
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
