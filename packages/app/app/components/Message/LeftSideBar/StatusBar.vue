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
        rounded
        base-color="success"
        mb-1
      >
        <template #title>
          <span text-xs>In a call · {{ callRoomName }}</span>
        </template>
      </v-list-item>
    </TransitionFade>
    <StyledCard flex p-2 rd-2>
      <MessageModelStatusPickerMenuButton>
        <template #activator="{ menuProps }">
          <div cursor-pointer :="menuProps">
            <MessageModelMemberStatusAvatar
              :id="session.user.id"
              :image="session.user.image"
              :name="session.user.name"
            />
          </div>
        </template>
      </MessageModelStatusPickerMenuButton>
      <div w-full flex justify-between overflow-hidden>
        <div pl-2 flex flex-col justify-center overflow-hidden>
          <div class="text-xs" truncate>
            {{ session.user.name }}
          </div>
          <div class="text-xs text-gray" truncate>
            {{ getStatusMessage(session.user.id) || getStatusEnum(session.user.id) }}
          </div>
        </div>
        <div flex flex-shrink-0>
          <MessageLeftSideBarSettingsDialogButton>
            <template #activator="activatorProps">
              <v-btn :="activatorProps" icon="mdi-cog" size="small" />
            </template>
          </MessageLeftSideBarSettingsDialogButton>
        </div>
      </div>
    </StyledCard>
  </div>
</template>
