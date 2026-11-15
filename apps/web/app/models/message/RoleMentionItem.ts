import type { MentionType } from "@esposter/shared";

export interface RoleMentionItem {
  color: string;
  id: string;
  name: string;
  type: typeof MentionType.Role;
}
