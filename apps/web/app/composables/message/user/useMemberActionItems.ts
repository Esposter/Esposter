// @unocss-include
import type { Item } from "@/models/shared/Item";
import type { RoomInMessage, User } from "@esposter/db-schema";

import { checkIsMemberManageable } from "#shared/services/room/rbac/checkIsMemberManageable";
import { MemberDialogType } from "@/models/message/user/MemberDialogType";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { authClient } from "@/services/auth/authClient";
import { AdminActionIconMap } from "@/services/message/moderation/AdminActionIconMap";
import { useClipboardStore } from "@/store/clipboard";
import { useModerationNoteStore } from "@/store/message/moderation/note";
import { useRoomStore } from "@/store/message/room";
import { useDirectMessageStore } from "@/store/message/room/directMessage";
import { useRoleStore } from "@/store/message/room/role";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";
import { useFriendStore } from "@/store/message/user/friend";
import { useFriendRequestStore } from "@/store/message/user/friendRequest";
import { AdminActionType, checkHasPermission, RoomPermission } from "@esposter/db-schema";

// What can be done to a member, behind their profile's overflow menu and their row's context menu alike, so the two
// Never disagree. A dialog an action opens belongs to the row, which outlives the profile's popover
export const useMemberActionItems = (
  user: MaybeRefOrGetter<Pick<User, "id" | "name">>,
  // Empty outside a room, where no moderation applies
  roomId: MaybeRefOrGetter<RoomInMessage["id"]>,
  openDialog: (type: MemberDialogType) => void,
) => {
  const session = authClient.useSession();
  const clipboardStore = useClipboardStore();
  const { copy } = clipboardStore;
  const friendStore = useFriendStore();
  const { checkIsFriend } = friendStore;
  const friendRequestStore = useFriendRequestStore();
  const { checkHasSentFriendRequest, sendFriendRequest } = friendRequestStore;
  const directMessageStore = useDirectMessageStore();
  const { createDirectMessage } = directMessageStore;
  const roomStore = useRoomStore();
  const { rooms } = storeToRefs(roomStore);
  const roleStore = useRoleStore();
  const { getMemberRoleMap, getMyPermissions } = roleStore;
  const userToRoomStore = useUserToRoomStore();
  const { getDisplayName } = userToRoomStore;
  const moderationNoteStore = useModerationNoteStore();
  const { getModerationNoteCount } = moderationNoteStore;
  const isSelf = computed(() => session.value.data?.user.id === toValue(user).id);
  // The moderator picked this member off a list that names them by nickname, so every action names them the same way
  const displayName = computed(() => getDisplayName(toValue(user), toValue(roomId)));
  // Discord leads a stranger's profile with adding them and a friend's with messaging them, and a direct message is
  // Only ever opened with a friend
  const friendItem = computed<Item | undefined>(() => {
    const userId = toValue(user).id;
    if (isSelf.value || checkHasSentFriendRequest(userId)) return undefined;
    else if (checkIsFriend(userId))
      return {
        meaning: UiIconMeaning.Comment,
        onClick: async () => {
          await createDirectMessage([userId]);
        },
        title: "Message",
      };
    else
      return {
        icon: "i-mdi:account-plus",
        onClick: async () => {
          await sendFriendRequest(userId);
        },
        title: "Add friend",
      };
  });
  const copyUserIdItem: Item = {
    meaning: UiIconMeaning.Copy,
    onClick: async () => {
      await copy(toValue(user).id);
    },
    title: "Copy user ID",
  };
  // An unloaded member role map is not the same as a member with no roles: the first hides the actions until the
  // Roles arrive, the second is a real position below every assigned role
  const targetTopPosition = computed(() => {
    const roomIdValue = toValue(roomId);
    const roles = roomIdValue ? getMemberRoleMap(roomIdValue)?.get(toValue(user).id) : undefined;
    if (roles) return Math.max(-1, ...roles.map(({ position }) => position));
    else return undefined;
  });
  // The owner is the one member no moderator may act on, and the server says so too — offering the actions here
  // Would only surface a rejection
  const manageablePermissions = computed(() => {
    const roomIdValue = toValue(roomId);
    if (!roomIdValue || isSelf.value) return undefined;

    const permissions = getMyPermissions(roomIdValue);
    if (!permissions || targetTopPosition.value === undefined) return undefined;

    const isTargetOwner = rooms.value.find(({ id }) => id === roomIdValue)?.userId === toValue(user).id;
    const actor = { isOwner: permissions.isRoomOwner, topPosition: permissions.topRolePosition };
    const target = { isOwner: isTargetOwner, topPosition: targetTopPosition.value };
    return checkIsMemberManageable(actor, target) ? permissions : undefined;
  });
  const checkHasManageablePermission = (permission: RoomPermission) =>
    Boolean(
      manageablePermissions.value &&
      checkHasPermission(manageablePermissions.value.permissions, permission, manageablePermissions.value.isRoomOwner),
    );
  const isBannable = computed(() => checkHasManageablePermission(RoomPermission.BanMembers));
  const isKickable = computed(() => checkHasManageablePermission(RoomPermission.KickMembers));
  const isWarnable = computed(() => checkHasManageablePermission(RoomPermission.ManageMessages));
  // Mildest first, as Discord orders them: a note, a warning, a timeout, then the three that remove the member
  const moderationItems = computed(() => {
    const items: Item[] = [
      ...(isKickable.value
        ? [
            {
              icon: "i-mdi:note-text-outline",
              onClick: () => {
                openDialog(MemberDialogType.Notes);
              },
              // Counted once the member's notes have been read, which the profile does as it opens
              title:
                getModerationNoteCount(toValue(user).id) > 0
                  ? `Notes (${getModerationNoteCount(toValue(user).id)})`
                  : "Notes",
            },
          ]
        : []),
      ...(isWarnable.value
        ? [
            {
              icon: AdminActionIconMap[AdminActionType.Warn],
              onClick: () => {
                openDialog(MemberDialogType.Warn);
              },
              title: `Warn ${displayName.value}`,
            },
          ]
        : []),
      ...(isKickable.value
        ? [
            {
              icon: AdminActionIconMap[AdminActionType.TimeoutUser],
              onClick: () => {
                openDialog(MemberDialogType.Timeout);
              },
              title: `Timeout ${displayName.value}`,
            },
            {
              icon: AdminActionIconMap[AdminActionType.KickFromRoom],
              isDanger: true,
              onClick: () => {
                openDialog(MemberDialogType.Kick);
              },
              title: `Kick ${displayName.value}`,
            },
          ]
        : []),
      ...(isBannable.value
        ? [
            {
              icon: AdminActionIconMap[AdminActionType.SoftBan],
              isDanger: true,
              onClick: () => {
                openDialog(MemberDialogType.SoftBan);
              },
              title: `Soft ban ${displayName.value}`,
            },
            {
              icon: AdminActionIconMap[AdminActionType.CreateBan],
              isDanger: true,
              onClick: () => {
                openDialog(MemberDialogType.Ban);
              },
              title: `Ban ${displayName.value}`,
            },
          ]
        : []),
    ];
    const [firstItem, ...restItems] = items;
    return firstItem ? [{ ...firstItem, isGroupStart: true }, ...restItems] : [];
  });
  return { copyUserIdItem, friendItem, isKickable, moderationItems };
};
