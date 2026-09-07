<script setup lang="ts">
import type { RoomInMessage, User } from "@esposter/db-schema";
import type { VNodeChild } from "vue";
import type { VHover } from "vuetify/lib/components/VHover/VHover.mjs";
import type { ListItemSlot } from "vuetify/lib/components/VList/VListItem.mjs";

import { getTopRole } from "@/services/message/member/getTopRole";
import { useRoleStore } from "@/store/message/room/role";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";
import { mergeProps } from "vue";

interface Props {
  member: Pick<User, "id" | "image" | "name">;
  room: RoomInMessage;
}

type VHoverSlotProps = Extract<VHover["v-slot:default"], Function> extends (props: infer P) => VNodeChild ? P : never;

defineSlots<{
  append: ({ hoverProps, listItemProps }: { hoverProps: VHoverSlotProps; listItemProps: ListItemSlot }) => VNode;
}>();
const { member, room } = defineProps<Props>();
const emit = defineEmits<{ click: [event: KeyboardEvent | MouseEvent] }>();
const userToRoomStore = useUserToRoomStore();
const { getDisplayName } = userToRoomStore;
const displayName = computed(() => getDisplayName(member, room.id));
const roleStore = useRoleStore();
const { getMemberRoles } = roleStore;
const memberRoles = computed(() =>
  getMemberRoles(room.id, member.id).toSorted((firstRole, secondRole) => secondRole.position - firstRole.position),
);
const topRoleColor = computed(() => getTopRole(memberRoles.value)?.color || undefined);
const isMenuOpen = ref(false);
</script>

<template>
  <v-hover #default="{ isHovering, props: hoverProps }">
    <v-menu v-model="isMenuOpen" location="end" :close-on-content-click="false">
      <template #activator="{ props: menuProps }">
        <v-list-item
          :="mergeProps(hoverProps, menuProps)"
          :active="isMenuOpen"
          :value="member.id"
          @click="emit('click', $event)"
        >
          <template #prepend>
            <MessageModelMemberStatusAvatar :id="member.id" :image="member.image" :name="displayName" />
          </template>
          <v-list-item-title pr-6>
            <!-- Discord tints the display name with the member's top role color -->
            <div flex gap-x-1 items-center :style="{ color: topRoleColor }">
              {{ displayName }}
              <v-tooltip v-if="room.userId === member.id" text="Room Owner">
                <template #activator="{ props }">
                  <v-icon icon="mdi-crown" :="props" color="yellow-darken-4" />
                </template>
              </v-tooltip>
            </div>
            <div v-if="memberRoles.length > 0" mt-1 flex flex-wrap gap-1>
              <v-chip v-for="{ id, name, color } of memberRoles" :key="id" size="x-small" :color>
                {{ name }}
              </v-chip>
            </div>
          </v-list-item-title>
          <template #append="listItemProps">
            <slot name="append" :="{ hoverProps: { props: hoverProps, isHovering }, listItemProps }" />
          </template>
        </v-list-item>
      </template>
      <MessageModelUserProfileCard :user="member" />
    </v-menu>
  </v-hover>
</template>

<style scoped>
:deep(.v-list-item__prepend > .v-list-item__spacer) {
  width: 0.5rem;
}
</style>
