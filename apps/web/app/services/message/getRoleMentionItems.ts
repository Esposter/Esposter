import type { RoleMentionItem } from "#src/models/message/RoleMentionItem";

import { checkIsAssignableRole } from "#shared/services/room/rbac/checkIsAssignableRole";
import { useRoleStore } from "#src/store/message/room/role";
import { MentionType } from "@esposter/shared";

export const getRoleMentionItems = (query: string, roomId: string): RoleMentionItem[] => {
  const roleStore = useRoleStore();
  const { getRoles } = roleStore;
  const normalizedQuery = query.toLowerCase();
  return getRoles(roomId)
    .filter(
      (role) =>
        checkIsAssignableRole(role) && (!normalizedQuery || role.name.toLowerCase().startsWith(normalizedQuery)),
    )
    .map(({ color, id, name }) => ({ color, id, name, type: MentionType.Role }));
};
