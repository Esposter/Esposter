<script setup lang="ts">
import { authClient } from "@/services/auth/authClient";
import { useVoiceStore } from "@/store/message/room/voice";
import { useStatusStore } from "@/store/message/user/status";
import { RoutePath } from "@esposter/shared";

const { data: session } = await authClient.useSession(useFetch);
const statusStore = useStatusStore();
const { getStatusEnum } = statusStore;
const voiceStore = useVoiceStore();
const { callRoomId, isInChannel } = storeToRefs(voiceStore);
const callRoomName = useRoomName(callRoomId);
</script>

<template>
  <div v-if="session" px-2 pb-2>
    <Transition name="in-call">
      <v-list-item
        v-if="isInChannel"
        :to="callRoomId && RoutePath.Messages(callRoomId)"
        prepend-icon="mdi-phone"
        density="compact"
        rounded
        base-color="success"
        class="mb-1"
      >
        <template #title>
          <span text-xs>In a call · {{ callRoomName }}</span>
        </template>
      </v-list-item>
    </Transition>
    <StyledCard flex p-2 rd-2>
      <MessageModelMemberStatusAvatar :id="session.user.id" :image="session.user.image" :name="session.user.name" />
      <div w-full flex justify-between>
        <div pl-2 flex flex-col justify-center>
          <div class="text-xs">
            {{ session.user.name }}
          </div>
          <div class="text-xs text-gray">
            {{ getStatusEnum(session.user.id) }}
          </div>
        </div>
        <div flex>
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

<style scoped lang="scss">
.in-call-enter-active,
.in-call-leave-active {
  transition: opacity 0.2s ease;
}

.in-call-enter-from,
.in-call-leave-to {
  opacity: 0;
}
</style>
