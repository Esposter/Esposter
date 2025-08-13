<script setup lang="ts">
import type { User } from "#shared/db/schema/users";

import { authClient } from "@/services/auth/authClient";
import { useRoomStore } from "@/store/esbabbler/room";

interface MemberListItemProps {
  member: User;
}

const { member } = defineProps<MemberListItemProps>();
const { $trpc } = useNuxtApp();
const { data: session } = await authClient.useSession(useFetch);
const roomStore = useRoomStore();
const { currentRoom } = storeToRefs(roomStore);
const isCreator = computed(() => currentRoom.value?.userId === member.id);
const isKickable = computed(
  () => currentRoom.value?.userId === session.value?.user.id && member.id !== session.value?.user.id,
);
const isHovering = ref(false);
</script>

<template>
  <div relative @mouseover="isHovering = true" @mouseleave="isHovering = false">
    <v-list-item :value="member.name">
      <template #prepend>
        <EsbabblerModelMemberStatusAvatar :id="member.id" :image="member.image" :name="member.name" />
      </template>
      <v-list-item-title pr-6>
        <div flex items-center gap-x-1>
          {{ member.name }}
          <v-tooltip v-if="isCreator" text="Room Owner">
            <template #activator="{ props }">
              <v-icon icon="mdi-crown" :="props" color="yellow-darken-4" />
            </template>
          </v-tooltip>
        </div>
      </v-list-item-title>
    </v-list-item>
    <template v-if="isKickable">
      <v-tooltip :text="`Kick ${member.name}`">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            v-show="isHovering"
            absolute
            top="1/2"
            right-0
            translate-y="-1/2"
            bg-transparent="!"
            icon="mdi-close"
            variant="plain"
            size="small"
            :ripple="false"
            :="tooltipProps"
            @click="
              async () => {
                if (!currentRoom) return;
                await $trpc.room.deleteMember.mutate({ roomId: currentRoom.id, userId: member.id });
              }
            "
          />
        </template>
      </v-tooltip>
    </template>
  </div>
</template>

<style scoped lang="scss">
:deep(.v-list-item__prepend > .v-list-item__spacer) {
  width: 0.5rem !important;
}
</style>
