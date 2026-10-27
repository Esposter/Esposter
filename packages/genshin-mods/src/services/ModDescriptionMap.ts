import type { EnabledMods } from "../../types";
import { ModName } from "../models/ModName";

// Each mod's command, `/<name> [on|off]`, as the menu describes it
export const ModDescriptionMap: Record<keyof EnabledMods, string> = {
  [ModName.Commission]: "Show a goal's task list, how far it is and how long it has run.",
  [ModName.Pulse]: "Keep the machine watcher running.",
  [ModName.Resin]: "Show the cache, context, limits and cost, with warm, compact and handoff.",
  [ModName.Sins]: "Score each prompt's seven sins with TypeSafe, drawn as bars in a pane. Needs a TypeSafe key.",
  [ModName.Veil]: "Recording mode: show emails, amounts, phone numbers and secrets as placeholders.",
  [ModName.Ward]:
    "Ask before editing a file another session changed in the last half hour, and refuse a whole-index git command while one shares the checkout.",
  [ModName.Waypoints]: "Suggest the next steps after each answer, one press each.",
};

export const ModNames = Object.keys(ModDescriptionMap) as (keyof EnabledMods)[];
