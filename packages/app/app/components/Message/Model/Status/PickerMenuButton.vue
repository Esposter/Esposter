<script setup lang="ts">
import { SelectableStatuses } from "@/models/message/user/status/SelectableStatuses";
import { StatusIconMap } from "@/models/message/user/status/StatusIconMap";
import { authClient } from "@/services/auth/authClient";
import { StatusBadgePropsMap } from "@/services/message/StatusBadgePropsMap";
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
const save = async () => {
  const upsertedStatus = await $trpc.user.upsertStatus.mutate({
    message: statusMessage.value,
    status: selectedStatus.value,
  });
  const { userId, ...rest } = upsertedStatus;
  statusMap.value.set(userId, rest);
  menu.value = false;
};
</script>

<template>
  <v-menu v-model="menu" location="top" :close-on-content-click="false">
    <template #activator="{ props: menuProps }">
      <slot name="activator" :menu-props />
    </template>
    <StyledCard p-3 flex flex-col gap-2>
      <div text-sm font-bold>Set Status</div>
      <v-list density="compact" py-0>
        <v-list-item
          v-for="selectableStatus in SelectableStatuses"
          :key="selectableStatus"
          :active="selectableStatus === selectedStatus"
          :value="selectableStatus"
          rd
          @click="selectedStatus = selectableStatus"
        >
          <template #prepend>
            <v-icon
              mr-2
              size="small"
              :color="StatusBadgePropsMap[selectableStatus].color"
              :icon="StatusIconMap[selectableStatus]"
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
        @keydown.enter="save()"
      />
      <div flex justify-end>
        <v-btn color="primary" size="small" text="Save" variant="elevated" @click="save()" />
      </div>
    </StyledCard>
  </v-menu>
</template>
