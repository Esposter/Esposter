import type { MentionType } from "@esposter/shared";

export interface MentionNodeAttributes {
  id: null | string;
  label?: null | string;
  type?: MentionType;
}
