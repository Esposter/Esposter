import type { RoleMentionItem } from "@/models/message/RoleMentionItem";

import { useRoleStore } from "@/store/message/room/role";
import { MentionType } from "@esposter/shared";

export const getRoleMentionItems = (query: string): RoleMentionItem[] => {
  const roleStore = useRoleStore();
  const { roles } = storeToRefs(roleStore);
  return roles.value
    .filter((role) => !role.isEveryone && (!query || role.name.toLowerCase().startsWith(query.toLowerCase())))
    .map(({ color, id, name }) => ({ color, id, name, type: MentionType.Role }));
};
