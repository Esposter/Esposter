<script setup lang="ts">
import { authClient } from "@/services/auth/authClient";
import { useStatusStore } from "@/store/message/user/status";
import { STATUS_MESSAGE_MAX_LENGTH, UserStatus } from "@esposter/db-schema";

const { $trpc } = useNuxtApp();
const { data: session } = await authClient.useSession(useFetch);
const userId = computed(() => session.value?.user.id ?? "");
const statusStore = useStatusStore();
const { statusMap } = storeToRefs(statusStore);
const status = computed(() => statusMap.value.get(userId.value)?.status ?? UserStatus.Online);
const message = computed(() => statusMap.value.get(userId.value)?.message ?? "");
const selectedStatus = ref(status.value);
const statusMessage = ref(message.value);
const menu = ref(false);

watch(menu, (isOpen) => {
  if (!isOpen) return;
  selectedStatus.value = status.value;
  statusMessage.value = message.value;
});

const onSave = async () => {
  await $trpc.user.upsertStatus.mutate({ message: statusMessage.value, status: selectedStatus.value });
  menu.value = false;
};

const StatusIconMap = {
  [UserStatus.DoNotDisturb]: { color: "red", icon: "mdi-minus-circle" },
  [UserStatus.Idle]: { color: "yellow-darken-2", icon: "mdi-moon-waning-crescent" },
  [UserStatus.Offline]: { color: "grey", icon: "mdi-circle-outline" },
  [UserStatus.Online]: { color: "green", icon: "mdi-circle" },
} as const satisfies Record<UserStatus, { color: string; icon: string }>;

const selectableStatuses = [UserStatus.Online, UserStatus.Idle, UserStatus.DoNotDisturb] as const;
</script>

<template>
  <v-menu v-model="menu" location="top" :close-on-content-click="false" min-width="260">
    <template #activator="{ props: menuProps }">
      <slot name="activator" :menu-props />
    </template>
    <StyledCard p-3 flex flex-col gap-2>
      <div text-sm font-bold>Set Status</div>
      <v-list density="compact" py-0>
        <v-list-item
          v-for="selectableStatus in selectableStatuses"
          :key="selectableStatus"
          :active="selectableStatus === status"
          :value="selectableStatus"
          rounded
          @click="selectedStatus = selectableStatus"
        >
          <template #prepend>
            <v-icon
              :color="StatusIconMap[selectableStatus].color"
              :icon="StatusIconMap[selectableStatus].icon"
              size="small"
              mr-2
            />
          </template>
          <v-list-item-title>{{ selectableStatus }}</v-list-item-title>
        </v-list-item>
      </v-list>
      <v-divider />
      <v-text-field
        v-model="statusMessage"
        label="What's on your mind?"
        density="compact"
        hide-details
        :maxlength="STATUS_MESSAGE_MAX_LENGTH"
        variant="outlined"
        @keydown.enter="onSave()"
      />
      <div flex justify-end>
        <v-btn color="primary" size="small" text="Save" variant="elevated" @click="onSave()" />
      </div>
    </StyledCard>
  </v-menu>
</template>
