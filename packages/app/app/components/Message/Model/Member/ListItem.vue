<script setup lang="ts">
import type { User } from "@esposter/db-schema";
import type { VNodeChild } from "vue";
import type { VHover } from "vuetify/lib/components/VHover/VHover.mjs";
import type { ListItemSlot } from "vuetify/lib/components/VList/VListItem.mjs";

import { useRoomStore } from "@/store/message/room";
import { useRoleStore } from "@/store/message/room/role";
import { mergeProps } from "vue";

interface MemberListItemProps {
  member: User;
}

type VHoverSlotProps = Extract<VHover["v-slot:default"], Function> extends (props: infer P) => VNodeChild ? P : never;

defineSlots<{
  append: ({ hoverProps, listItemProps }: { hoverProps: VHoverSlotProps; listItemProps: ListItemSlot }) => VNode;
}>();
const { member } = defineProps<MemberListItemProps>();
const emit = defineEmits<{ click: [event: KeyboardEvent | MouseEvent] }>();
const roomStore = useRoomStore();
const { currentRoom } = storeToRefs(roomStore);
const isCreator = computed(() => currentRoom.value?.userId === member.id);
const roleStore = useRoleStore();
const { getMemberRoles } = roleStore;
const memberRoles = computed(() =>
  currentRoom.value?.id
    ? getMemberRoles(currentRoom.value.id, member.id).toSorted((a, b) => b.position - a.position)
    : [],
);
const isMenuOpen = ref(false);
</script>

<template>
  <v-hover #default="{ isHovering, props: hoverProps }">
    <v-menu v-model="isMenuOpen" location="end" :close-on-content-click="false">
      <template #activator="{ props: menuProps }">
        <v-list-item
          :="mergeProps(hoverProps, menuProps)"
          :active="isMenuOpen"
          :value="member.name"
          @click="emit('click', $event)"
        >
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
            <div v-if="memberRoles.length > 0" flex flex-wrap gap-1 mt-1>
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

<style scoped lang="scss">
:deep(.v-list-item__prepend > .v-list-item__spacer) {
  width: 0.5rem;
}
</style>
