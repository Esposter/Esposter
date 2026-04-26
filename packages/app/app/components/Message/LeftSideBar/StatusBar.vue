<script setup lang="ts">
import { authClient } from "@/services/auth/authClient";
import { useVoiceStore } from "@/store/message/room/voice";
import { useStatusStore } from "@/store/message/user/status";
import { RoutePath } from "@esposter/shared";

const { data: session } = await authClient.useSession(useFetch);
const statusStore = useStatusStore();
const { getStatusEnum, getStatusMessage } = statusStore;
const voiceStore = useVoiceStore();
const { callRoomId, isInChannel } = storeToRefs(voiceStore);
const callRoomName = useRoomName(callRoomId);
</script>

<template>
  <div v-if="session" px-2 pb-2>
    <TransitionFade>
      <v-list-item
        v-if="isInChannel"
        :to="callRoomId && RoutePath.Messages(callRoomId)"
        prepend-icon="mdi-phone"
        density="compact"
        rd
        base-color="success"
        mb-1
      >
        <template #title>
          <span text-xs>In a call · {{ callRoomName }}</span>
        </template>
      </v-list-item>
    </TransitionFade>
    <StyledCard flex p-2 items-center rd-2>
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
      <div w-full min-w-0 flex justify-between>
        <div pl-2 min-w-0 flex flex-col justify-center>
          <div text-xs truncate>
            {{ session.user.name }}
          </div>
          <div text-xs text-gray truncate>
            {{ getStatusMessage(session.user.id) || getStatusEnum(session.user.id) }}
          </div>
        </div>
        <MessageLeftSideBarSettingsDialogButton>
          <template #activator="activatorProps">
            <v-btn :="activatorProps" icon="mdi-cog" size="small" />
          </template>
        </MessageLeftSideBarSettingsDialogButton>
      </div>
    </StyledCard>
  </div>
</template>
