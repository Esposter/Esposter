<script setup lang="ts">
import { SelectableStatusDefinitionList } from "@/models/message/user/status/SelectableStatusDefinitionList";
import { StatusIconMap } from "@/models/message/user/status/StatusIconMap";
import { authClient } from "@/services/auth/authClient";
import { StatusBadgePropsMap } from "@/services/message/StatusBadgePropsMap";
import { useStatusStore } from "@/store/message/user/status";
import { STATUS_MESSAGE_MAX_LENGTH, UserStatus } from "@esposter/db-schema";
import { noop } from "@esposter/shared";

defineSlots<{ activator: (props: { menuProps: Record<string, unknown> }) => VNode }>();
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
const { executeMutation } = useMutation();
const save = async () => {
  menu.value = false;
  await executeMutation(
    () => $trpc.user.upsertStatus.mutate({ message: statusMessage.value, status: selectedStatus.value }),
    {
      // Read as the write is sent, so a rejected save restores what the save ahead of it stored rather than the
      // Status on screen when the user clicked. Nothing is applied when there is no record yet — the row carries
      // Fields only the server can fill in, so it is left to onSuccess
      applyOptimistic: () => {
        const previousStatus = statusMap.value.get(userId.value);
        if (!previousStatus) return noop;

        const { message: previousMessage, status: previousUserStatus } = previousStatus;
        statusMap.value.set(userId.value, {
          ...previousStatus,
          message: statusMessage.value,
          status: selectedStatus.value,
        });
        return () => {
          // Only the two fields this write moved, against the record as it stands — reinstating the row as a
          // Whole would undo the connection state a presence push landed while this write was in flight
          const currentStatus = statusMap.value.get(userId.value);
          if (currentStatus)
            statusMap.value.set(userId.value, {
              ...currentStatus,
              message: previousMessage,
              status: previousUserStatus,
            });
        };
      },
      key: userId.value,
      onSuccess: ({ userId: upsertedUserId, ...rest }) => {
        statusMap.value.set(upsertedUserId, rest);
      },
    },
  );
};
</script>

<template>
  <v-menu v-model="menu" location="top" :close-on-content-click="false">
    <template #activator="{ props: menuProps }">
      <slot name="activator" :menu-props />
    </template>
    <StyledCard p-3 flex flex-col gap-2>
      <div font-bold text-title-small>Set Status</div>
      <v-list density="compact" py-0>
        <v-list-item
          v-for="{ label, status: selectableStatus, subtitle } in SelectableStatusDefinitionList"
          :key="selectableStatus"
          :active="selectableStatus === selectedStatus"
          :subtitle
          rd
          @click="
            () => {
              if (selectableStatus === selectedStatus) save();
              else selectedStatus = selectableStatus;
            }
          "
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
