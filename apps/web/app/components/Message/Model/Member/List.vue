<script setup lang="ts">
import type { MemberDialogType } from "@/models/message/user/MemberDialogType";
import type { UiItem } from "@/models/ui/UiItem";
import type { UiListItem } from "@/models/ui/UiListItem";

import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { MEMBER_PROFILE_POSITION_AREA } from "@/services/message/member/constants";
import { getMemberGroups } from "@/services/message/member/getMemberGroups";
import { getTopRole } from "@/services/message/member/getTopRole";
import { useRoomStore } from "@/store/message/room";
import { useRoleStore } from "@/store/message/room/role";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";
import { useMemberStore } from "@/store/message/user/member";
import { useStatusStore } from "@/store/message/user/status";

const { readMembers, readMoreMembers } = useReadMembers();
const { isPending } = await readMembers();
const memberStore = useMemberStore();
const { hasMore, memberCount, memberCountsByTopRole, members } = storeToRefs(memberStore);
const roomStore = useRoomStore();
const { currentRoom } = storeToRefs(roomStore);
const roleStore = useRoleStore();
const { getMemberRoles } = roleStore;
const userToRoomStore = useUserToRoomStore();
const { getDisplayName } = userToRoomStore;
const statusStore = useStatusStore();
const { getStatusMessage } = statusStore;
const memberMap = computed(() => new Map(members.value.map((member) => [member.id, member])));
const roleIdMemberCountMap = computed(
  () => new Map(memberCountsByTopRole.value.map((countByTopRole) => [countByTopRole.roleId, countByTopRole.count])),
);
// Derived from the running total so member join/leave subscription updates keep the roleless group current
const rolelessMemberCount = computed(
  () => memberCount.value - memberCountsByTopRole.value.reduce((sum, countByTopRole) => sum + countByTopRole.count, 0),
);
const getMemberCountSuffix = (roleId: string) => {
  const groupMemberCount = roleId ? roleIdMemberCountMap.value.get(roleId) : rolelessMemberCount.value;
  return groupMemberCount === undefined ? "" : ` — ${groupMemberCount}`;
};
// Discord's member list: one group per top role, headed by its name and how many hold it, each member's avatar with
// Their status as the mark and their status message after the name
const memberItems = computed(() => {
  const room = currentRoom.value;
  if (!room) return [];
  return getMemberGroups(members.value, (userId) => getMemberRoles(room.id, userId)).flatMap(
    ({ members: groupMembers, role }) => {
      const group = `${role?.name ?? "Members"}${getMemberCountSuffix(role?.id ?? "")}`;
      return groupMembers.map<UiListItem<string>>((member) => ({
        description: getStatusMessage(member.id) || undefined,
        group,
        hasMarkSlot: true,
        title: getDisplayName(member, room.id),
        value: member.id,
      }));
    },
  );
});
// Discord tints the display name with the member's top role color
const getTopRoleColor = (userId: string) => {
  const room = currentRoom.value;
  return room ? getTopRole(getMemberRoles(room.id, userId))?.color || undefined : undefined;
};
// One profile for the whole list, hung off the row that opened it
const isProfileOpen = ref(false);
const profileAnchor = ref<HTMLElement>();
// The member whose profile is open or whose actions were last asked for: a dialog an action opens outlives the
// Profile's popover
const memberId = ref("");
const member = computed(() => memberMap.value.get(memberId.value));
const getMemberDisplayName = (user?: typeof member.value) =>
  user && currentRoom.value ? getDisplayName(user, currentRoom.value.id) : "";
const openedDialogType = ref<MemberDialogType>();
// Kept apart from the member above, which a right-click on another row moves while the dialog is still open
const dialogMember = ref<typeof member.value>();
const openDialog = (type: MemberDialogType) => {
  dialogMember.value = member.value;
  openedDialogType.value = type;
};
const { copyUserIdItem, friendItem, moderationItems } = useMemberActionItems(
  () => member.value ?? { id: "", name: "" },
  () => currentRoom.value?.id ?? "",
  openDialog,
);
const openProfile = (userId: string) => {
  const row = window.document.querySelector(`[data-member-id="${userId}"]`);
  if (!(row instanceof HTMLElement)) return;
  memberId.value = userId;
  profileAnchor.value = row;
  isProfileOpen.value = true;
};
const { getContextMenuProps } = useContextMenu();
// Everything the profile offers, and the profile itself, which the row opens on a click as well
const getContextMenuItems = (userId: string): UiItem[] => {
  memberId.value = userId;
  return [
    {
      meaning: UiIconMeaning.Person,
      onClick: () => {
        openProfile(userId);
      },
      title: "Profile",
    },
    ...(friendItem.value ? [friendItem.value] : []),
    copyUserIdItem,
    ...moderationItems.value,
  ];
};
</script>

<template>
  <div p-2 flex flex-col gap-2>
    <ul v-if="isPending" aria-busy="true" aria-label="Members" flex flex-col>
      <MessageModelMemberListItemSkeleton v-for="index of DEFAULT_READ_LIMIT" :key="index" />
    </ul>
    <template v-else-if="currentRoom">
      <UiList
        :get-row-props="
          ({ value }) => ({
            ...getContextMenuProps(value, () => getContextMenuItems(value)),
            'data-member-id': value,
          })
        "
        :items="memberItems"
        label="Members"
        @select="openProfile($event)"
      >
        <template #mark="{ item }">
          <MessageModelMemberStatusAvatar
            :id="item.value"
            :image="memberMap.get(item.value)?.image ?? null"
            :name="item.title"
            is-small
          />
        </template>
        <template #title="{ item }">
          <span :style="{ color: getTopRoleColor(item.value) }">{{ item.title }}</span>
        </template>
        <template #append="{ item }">
          <UiIcon
            v-if="currentRoom.userId === item.value"
            label="Room owner"
            :meaning="UiIconMeaning.Owner"
            text-warning
          />
        </template>
      </UiList>
      <UiPopover
        v-model:is-open="isProfileOpen"
        :anchor="profileAnchor"
        :label="getMemberDisplayName(member)"
        :position-area="MEMBER_PROFILE_POSITION_AREA"
      >
        <MessageModelUserProfileCard v-if="isProfileOpen && member" :user="member" @open:dialog="openDialog($event)" />
      </UiPopover>
      <MessageModelMemberActionDialog
        v-if="openedDialogType && dialogMember"
        v-model:type="openedDialogType"
        :display-name="getMemberDisplayName(dialogMember)"
        :room-id="currentRoom.id"
        :user="dialogMember"
      />
      <StyledWaypoint :is-active="hasMore" @change="(onComplete) => readMoreMembers(onComplete)">
        <ul aria-busy="true" aria-label="More members" flex flex-col>
          <MessageModelMemberListItemSkeleton v-for="index of DEFAULT_READ_LIMIT" :key="index" />
        </ul>
      </StyledWaypoint>
    </template>
  </div>
</template>
