import type { RoleMentionItem } from "@/models/message/RoleMentionItem";

import { useRoleStore } from "@/store/message/room/role";
import { MentionType } from "@esposter/shared";

export const getRoleMentionItems = (query: string): RoleMentionItem[] => {
  const roleStore = useRoleStore();
  const { roles } = storeToRefs(roleStore);
  const normalizedQuery = query.toLowerCase();
  return roles.value
    .filter((role) => !role.isEveryone && (!normalizedQuery || role.name.toLowerCase().startsWith(normalizedQuery)))
    .map(({ color, id, name }) => ({ color, id, name, type: MentionType.Role }));
};
