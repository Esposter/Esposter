<script setup lang="ts">
import { SelectableStatusDefinitionList } from "@/models/message/user/status/SelectableStatusDefinitionList";
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
const onStatusClick = (clickedStatus: UserStatus) => {
  if (clickedStatus === selectedStatus.value) save();
  else selectedStatus.value = clickedStatus;
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
          v-for="{ label, status: selectableStatus, subtitle } in SelectableStatusDefinitionList"
          :key="selectableStatus"
          :active="selectableStatus === selectedStatus"
          :subtitle
          rd
          @click="onStatusClick(selectableStatus)"
        >
          <template #prepend>
            <v-icon
              mr-2
              size="small"
              :color="StatusBadgePropsMap[selectableStatus].color"
              :icon="StatusIconMap[selectableStatus]"
            />
          </template>
          <v-list-item-title>{{ label }}</v-list-item-title>
        </v-list-item>
      </v-list>
      <v-divider />
      <v-text-field
        v-model="statusMessage"
        label="What's on your mind?"
        density="compact"
        hide-details
        :maxlength="STATUS_MESSAGE_MAX_LENGTH"
      />
      <StyledButton text="Save" @click="save()" />
    </StyledCard>
  </v-menu>
</template>
