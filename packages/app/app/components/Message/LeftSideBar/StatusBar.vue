<script setup lang="ts">
import { authClient } from "@/services/auth/authClient";
import { useCallStore } from "@/store/message/room/call";
import { useUserSettingsDialogStore } from "@/store/message/user/settings/dialog";
import { useStatusStore } from "@/store/message/user/status";
import { RoutePath } from "@esposter/shared";

const { data: session } = await authClient.useSession(useFetch);
const userSettingsDialogStore = useUserSettingsDialogStore();
const { isVisible } = storeToRefs(userSettingsDialogStore);
const statusStore = useStatusStore();
const { getStatusEnum, getStatusMessage } = statusStore;
const callStore = useCallStore();
const { activeCallSessionId, callRoomId, isInCall } = storeToRefs(callStore);
const callRoomName = useRoomName(callRoomId);
const callRoute = computed(() =>
  callRoomId.value ? RoutePath.Messages(callRoomId.value) : RoutePath.Calls(activeCallSessionId.value),
);
</script>

<template>
  <div v-if="session" px-2 pb-2>
    <TransitionFade>
      <v-list-item
        v-if="isInCall"
        :to="callRoute"
        prepend-icon="mdi-phone"
        density="compact"
        base-color="success"
        mb-1
        rd
      >
        <template #title>
          <span text-body-small>In a call{{ callRoomName ? ` · ${callRoomName}` : "" }}</span>
        </template>
      </v-list-item>
    </TransitionFade>
    <StyledCard p-2 rd-2 flex items-center>
      <MessageModelStatusPickerMenuButton>
        <template #activator="{ menuProps }">
          <MessageModelMemberStatusAvatar
            :id="session.user.id"
            :image="session.user.image"
            :name="session.user.name"
            :avatar-attrs="{ cursor: 'pointer' }"
            :avatar-props="menuProps"
          />
        </template>
      </MessageModelStatusPickerMenuButton>
      <div flex min-w-0 w-full justify-between>
        <div pl-2 flex flex-col min-w-0 justify-center>
          <div truncate text-body-small>
            {{ session.user.name }}
          </div>
          <div text-gray truncate text-body-small>
            {{ getStatusMessage(session.user.id) || getStatusEnum(session.user.id) }}
          </div>
        </div>
        <v-btn icon="mdi-cog" size="small" @click="isVisible = true" />
      </div>
    </StyledCard>
  </div>
</template>
