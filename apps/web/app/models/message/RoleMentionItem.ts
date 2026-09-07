import type { MentionType } from "@esposter/shared";

export interface RoleMentionItem {
  color: string;
  id: string;
  name: string;
  type: MentionType.Role;
}
