<script setup lang="ts">
import type { User } from "@esposter/db-schema";
import type { VNodeChild } from "vue";
import type { VHover } from "vuetify/lib/components/VHover/VHover.mjs";
import type { ListItemSlot } from "vuetify/lib/components/VList/VListItem.mjs";

import { authClient } from "@/services/auth/authClient";
import { useRoomStore } from "@/store/message/room";
import { useMemberStore } from "@/store/message/user/member";

interface MemberListItemProps {
  member: User;
}

type VHoverSlotProps = Extract<VHover["v-slot:default"], Function> extends (props: infer P) => VNodeChild ? P : never;

const slots = defineSlots<{
  append: ({ hoverProps, listItemProps }: { hoverProps: VHoverSlotProps; listItemProps: ListItemSlot }) => VNode;
}>();
const { member } = defineProps<MemberListItemProps>();
const emit = defineEmits<{ click: [event: KeyboardEvent | MouseEvent] }>();
const { data: session } = await authClient.useSession(useFetch);
const roomStore = useRoomStore();
const { currentRoom, isCreator: isRoomCreator } = storeToRefs(roomStore);
const isCreator = computed(() => currentRoom.value?.userId === member.id);
const isKickable = computed(() => isRoomCreator.value && member.id !== session.value?.user.id);
const memberStore = useMemberStore();
const { deleteMember } = memberStore;
</script>

<template>
  <v-hover #default="{ isHovering, props: hoverProps }">
    <v-list-item :="hoverProps" :value="member.name" @click="emit('click', $event)">
      <template #prepend>
        <MessageModelMemberStatusAvatar :id="member.id" :image="member.image" :name="member.name" />
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
      <template #append="listItemProps">
        <slot name="append" :="{ hoverProps: { props: hoverProps, isHovering }, listItemProps }">
          <template v-if="isKickable">
            <StyledDeleteDialog
              :card-props="{ title: 'Kick Member', text: `Are you sure you want to kick ${member.name}?` }"
              :confirm-button-props="{ text: 'Kick' }"
              @delete="
                async (onComplete) => {
                  try {
                    if (!currentRoom) return;
                    await deleteMember({ roomId: currentRoom.id, userId: member.id });
                  } finally {
                    onComplete();
                  }
                }
              "
            >
              <template #activator="{ updateIsOpen }">
                <v-tooltip :text="`Kick ${member.name}`">
                  <template #activator="{ props: tooltipProps }">
                    <v-btn
                      v-show="isHovering"
                      :="tooltipProps"
                      bg-transparent="!"
                      icon="mdi-close"
                      variant="plain"
                      size="small"
                      :ripple="false"
                      @click.stop="updateIsOpen(true)"
                    />
                  </template>
                </v-tooltip>
              </template>
            </StyledDeleteDialog>
          </template>
        </slot>
      </template>
    </v-list-item>
  </v-hover>
</template>

<style scoped lang="scss">
:deep(.v-list-item__prepend > .v-list-item__spacer) {
  width: 0.5rem !important;
}
</style>
