<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { authClient } from "@/services/auth/authClient";
import { useCallStore } from "@/store/message/room/call";
import { useStatusStore } from "@/store/message/user/status";

const { data: session } = await authClient.useSession(useFetch);
const statusStore = useStatusStore();
const { getStatusMessage, getUserStatus } = statusStore;
const callStore = useCallStore();
const { callRoomId, callRoute, isInCall } = storeToRefs(callStore);
const callRoomName = useRoomName(callRoomId);
</script>

<!-- The reader's own strip at the sidebar's foot, as Discord keeps it: the call they are in above who they are -->
<template>
  <template v-if="session">
    <div bg-divider h="[var(--ui-border-width)]" />
    <div p-2 flex flex-col gap-1>
      <TransitionFade>
        <NuxtLink v-if="isInCall" :to="callRoute" ui-item no-underline>
          <UiItemContent :description="callRoomName || undefined" title="In a call">
            <template #mark>
              <UiIcon :meaning="UiIconMeaning.Call" text-success />
            </template>
          </UiItemContent>
        </NuxtLink>
      </TransitionFade>
      <div flex gap-2 items-center>
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
        <div flex flex-1 flex-col min-w-0>
          <span truncate>{{ session.user.name }}</span>
          <span text-sm text-muted truncate>
            {{ getStatusMessage(session.user.id) || getUserStatus(session.user.id) }}
          </span>
        </div>
        <MessageLeftSideBarSettingsButton />
      </div>
    </div>
  </template>
</template>
