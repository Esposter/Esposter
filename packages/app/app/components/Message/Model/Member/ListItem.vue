<script setup lang="ts">
import type { User } from "@esposter/db-schema";
import type { VNodeChild } from "vue";
import type { VHover } from "vuetify/lib/components/VHover/VHover.mjs";
import type { ListItemSlot } from "vuetify/lib/components/VList/VListItem.mjs";

import { hasPermission } from "#shared/services/room/rbac/hasPermission";
import { authClient } from "@/services/auth/authClient";
import { TimeoutDurationMap } from "@/services/message/moderation/TimeoutDurationMap";
import { useRoomStore } from "@/store/message/room";
import { useRoleStore } from "@/store/message/room/role";
import { AdminActionType, RoomPermission } from "@esposter/db-schema";
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
const { data: session } = await authClient.useSession(useFetch);
const roomStore = useRoomStore();
const { currentRoom } = storeToRefs(roomStore);
const isCreator = computed(() => currentRoom.value?.userId === member.id);
const { $trpc } = useNuxtApp();
const roleStore = useRoleStore();
const { memberRoleMap, myPermissionsMap } = storeToRefs(roleStore);
const memberRoles = computed(() =>
  (currentRoom.value?.id ? (memberRoleMap.value.get(member.id) ?? []) : []).toSorted((a, b) => b.position - a.position),
);
const isSelf = computed(() => session.value?.user.id === member.id);
const permissionsData = computed(() =>
  currentRoom.value?.id ? myPermissionsMap.value.get(currentRoom.value.id) : undefined,
);
const canBan = computed(() => {
  const data = permissionsData.value;
  if (!data) return false;
  return hasPermission(data.permissions, RoomPermission.BanMembers, data.isRoomOwner);
});
const canKick = computed(() => {
  const data = permissionsData.value;
  if (!data) return false;
  return hasPermission(data.permissions, RoomPermission.KickMembers, data.isRoomOwner);
});
const timeoutDurationSelectItems = Object.entries(TimeoutDurationMap).map(([title, value]) => ({ title, value }));
const selectedTimeoutDurationMs = ref(TimeoutDurationMap["1 minute"]);
</script>

<template>
  <v-hover #default="{ isHovering, props: hoverProps }">
    <v-menu location="end" :close-on-content-click="false" open-on-hover :open-delay="400" :close-delay="100">
      <template #activator="{ props: menuProps }">
        <v-list-item :="mergeProps(hoverProps, menuProps)" :value="member.name" @click="emit('click', $event)">
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
              <v-chip v-for="{ id, name, color } of memberRoles" :key="id" size="x-small" :color="color ?? undefined">
                {{ name }}
              </v-chip>
            </div>
          </v-list-item-title>
          <template #append="listItemProps">
            <slot name="append" :="{ hoverProps: { props: hoverProps, isHovering }, listItemProps }">
              <template v-if="!isSelf">
                <StyledDeleteFormDialog
                  v-if="canBan"
                  :card-props="{ title: 'Ban User', text: `Are you sure you want to ban ${member.name}?` }"
                  :confirm-button-props="{ text: 'Ban' }"
                  @delete="
                    async (onComplete) => {
                      try {
                        if (!currentRoom) return;
                        await $trpc.moderation.executeAdminAction.mutate({
                          roomId: currentRoom.id,
                          targetUserId: member.id,
                          type: AdminActionType.CreateBan,
                        });
                      } finally {
                        onComplete();
                      }
                    }
                  "
                >
                  <template #activator="{ updateIsOpen }">
                    <v-tooltip text="Ban" location="top">
                      <template #activator="{ props: tooltipProps }">
                        <v-btn
                          v-show="isHovering"
                          :="tooltipProps"
                          color="error"
                          icon="mdi-account-cancel-outline"
                          variant="plain"
                          size="small"
                          :ripple="false"
                          @click.stop="updateIsOpen(true)"
                        />
                      </template>
                    </v-tooltip>
                  </template>
                </StyledDeleteFormDialog>
                <StyledDeleteFormDialog
                  v-if="canKick"
                  :card-props="{ title: 'Kick Member', text: `Are you sure you want to kick ${member.name}?` }"
                  :confirm-button-props="{ text: 'Kick' }"
                  @delete="
                    async (onComplete) => {
                      try {
                        if (!currentRoom) return;
                        await $trpc.moderation.executeAdminAction.mutate({
                          roomId: currentRoom.id,
                          targetUserId: member.id,
                          type: AdminActionType.KickFromRoom,
                        });
                      } finally {
                        onComplete();
                      }
                    }
                  "
                >
                  <template #activator="{ updateIsOpen }">
                    <v-tooltip :text="`Kick ${member.name}`" location="top">
                      <template #activator="{ props: tooltipProps }">
                        <v-btn
                          v-show="isHovering"
                          :="tooltipProps"
                          icon="mdi-close"
                          variant="plain"
                          size="small"
                          :ripple="false"
                          @click.stop="updateIsOpen(true)"
                        />
                      </template>
                    </v-tooltip>
                  </template>
                </StyledDeleteFormDialog>
                <StyledFormDialog
                  v-if="canKick"
                  :card-props="{ title: `Timeout ${member.name}` }"
                  :confirm-button-props="{ color: 'warning', text: 'Timeout' }"
                  @submit="
                    async (_event, onComplete) => {
                      try {
                        if (!currentRoom) return;
                        await $trpc.moderation.executeAdminAction.mutate({
                          durationMs: selectedTimeoutDurationMs,
                          roomId: currentRoom.id,
                          targetUserId: member.id,
                          type: AdminActionType.TimeoutUser,
                        });
                      } finally {
                        onComplete();
                      }
                    }
                  "
                >
                  <template #activator="{ updateIsOpen }">
                    <v-tooltip text="Timeout" location="top">
                      <template #activator="{ props: tooltipProps }">
                        <v-btn
                          v-show="isHovering"
                          :="tooltipProps"
                          color="warning"
                          icon="mdi-timer-off-outline"
                          variant="plain"
                          size="small"
                          :ripple="false"
                          @click.stop="updateIsOpen(true)"
                        />
                      </template>
                    </v-tooltip>
                  </template>
                  <div px-4 py-2>
                    <v-select
                      v-model="selectedTimeoutDurationMs"
                      :items="timeoutDurationSelectItems"
                      label="Duration"
                    />
                  </div>
                </StyledFormDialog>
              </template>
            </slot>
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
