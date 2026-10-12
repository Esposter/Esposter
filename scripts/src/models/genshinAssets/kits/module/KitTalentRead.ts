import type { KitParameter } from "genshin-world";

// A read of a talent's table in a kit module: the parameters it can read, none where its group or index is chosen only
// As the kit plays
export interface KitTalentRead {
  parameters?: Exclude<KitParameter, number>[];
}
