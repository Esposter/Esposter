import type { AttackTag } from "genshin-world";

// A character's exceptions to the blunt rules, as the wiki's Blunt Attacks table gives them: the flag of every hit of
// An action by its attack tag, and the flag of one hit by its path in the record, which takes precedence over its action's
export interface KitBluntOverride {
  actions?: Partial<Record<AttackTag, boolean>>;
  hits?: Record<string, boolean>;
}
