<script setup lang="ts">
import type { Room } from "@esposter/db-schema";

import { useRoleStore } from "@/store/message/room/role";
import { RoomPermission } from "@esposter/db-schema";

interface PermissionsSettingsProps {
  roomId: Room["id"];
}

const { roomId } = defineProps<PermissionsSettingsProps>();
const roleStore = useRoleStore();
const { createRole, deleteRole, getRoles, readRoles, updateRole } = roleStore;

await readRoles(roomId);

const roles = computed(() => getRoles(roomId));
const selectedRoleId = ref(roles.value[0]?.id ?? null);
const selectedRole = computed(() => roles.value.find(({ id }) => id === selectedRoleId.value) ?? null);
const pendingPermissions = ref(selectedRole.value?.permissions ?? 0n);

watch(selectedRole, (newSelectedRole) => {
  pendingPermissions.value = newSelectedRole?.permissions ?? 0n;
});

const isDirty = computed(
  () => selectedRole.value !== null && pendingPermissions.value !== selectedRole.value.permissions,
);

const formatLabel = (key: string) => key.replace(/([A-Z])/g, " $1").trim();
const hasPermission = (permission: bigint) => Boolean(pendingPermissions.value & permission);
const togglePermission = (permission: bigint) => {
  pendingPermissions.value = pendingPermissions.value ^ permission;
};

const save = async () => {
  if (!selectedRole.value) return;
  await updateRole(roomId, { id: selectedRole.value.id, permissions: pendingPermissions.value });
};

const reset = () => {
  pendingPermissions.value = selectedRole.value?.permissions ?? 0n;
};

const newRoleName = ref("");
const isCreating = ref(false);

const onCreateRole = async () => {
  if (!newRoleName.value) return;
  isCreating.value = true;
  try {
    await createRole(roomId, { name: newRoleName.value, permissions: 0n, position: 0 });
    newRoleName.value = "";
    selectedRoleId.value = roles.value[0]?.id ?? null;
  } finally {
    isCreating.value = false;
  }
};

const onDelete = async (roleId: string) => {
  await deleteRole(roomId, { id: roleId });
  if (selectedRoleId.value === roleId) selectedRoleId.value = roles.value[0]?.id ?? null;
};
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col cols="auto" min-width="220px" max-width="260px">
        <v-row no-gutters mb-3>
          <v-col>
            <v-text-field v-model="newRoleName" label="Role name" density="compact" hide-details />
          </v-col>
          <v-col cols="auto" ml-2>
            <v-tooltip text="Add Role">
              <template #activator="{ props: tooltipProps }">
                <v-btn
                  :="tooltipProps"
                  :disabled="!newRoleName"
                  :loading="isCreating"
                  density="compact"
                  icon="mdi-plus"
                  variant="tonal"
                  @click="onCreateRole()"
                />
              </template>
            </v-tooltip>
          </v-col>
        </v-row>
        <v-list density="compact" rounded>
          <v-list-item
            v-for="role of roles"
            :key="role.id"
            :active="role.id === selectedRoleId"
            @click="selectedRoleId = role.id"
          >
            <template #prepend>
              <div
                w-3
                h-3
                rd-full
                mr-2
                :style="{ backgroundColor: role.color ?? 'rgb(var(--v-theme-on-surface-variant))' }"
              />
            </template>
            <v-list-item-title>{{ role.name }}</v-list-item-title>
            <template #append>
              <v-tooltip v-if="!role.isEveryone" text="Delete Role">
                <template #activator="{ props: tooltipProps }">
                  <v-btn
                    :="tooltipProps"
                    density="compact"
                    icon="mdi-trash-can-outline"
                    variant="plain"
                    size="x-small"
                    color="error"
                    @click.stop="onDelete(role.id)"
                  />
                </template>
              </v-tooltip>
            </template>
          </v-list-item>
        </v-list>
      </v-col>
      <v-col v-if="selectedRole">
        <v-row no-gutters mb-2>
          <v-col>
            <div text-lg font-bold>{{ selectedRole.name }}</div>
          </v-col>
        </v-row>
        <v-list density="compact" rounded>
          <v-list-item v-for="[key, permission] of Object.entries(RoomPermission)" :key :title="formatLabel(key)">
            <template #append>
              <v-switch
                :model-value="hasPermission(permission)"
                color="primary"
                density="compact"
                hide-details
                @update:model-value="togglePermission(permission)"
              />
            </template>
          </v-list-item>
        </v-list>
        <v-row v-if="isDirty" no-gutters mt-3>
          <v-col cols="auto" mr-2>
            <v-btn color="primary" variant="tonal" @click="save()">Save Changes</v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn variant="plain" @click="reset()">Reset</v-btn>
          </v-col>
        </v-row>
      </v-col>
      <v-col v-else class="text-medium-emphasis" d-flex align-center justify-center>
        Select a role to edit its permissions.
      </v-col>
    </v-row>
  </v-container>
</template>
