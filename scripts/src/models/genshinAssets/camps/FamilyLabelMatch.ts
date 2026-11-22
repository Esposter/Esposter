import type { EnemyKindId } from "genshin-world";

export interface FamilyLabelMatch {
  kindId: EnemyKindId;
  label: string;
  page: string;
  variant: string;
}
