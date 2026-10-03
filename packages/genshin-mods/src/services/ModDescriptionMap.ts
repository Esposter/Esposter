import type { EnabledMods } from "../../types";

// Each mod's command, `/<name> [on|off]`, as the menu describes it
export const ModDescriptionMap: Record<keyof EnabledMods, string> = {
  commission: "Show a goal's task list, how far it is and how long it has run.",
  resin: "Show the cache, context, limits and cost, with warm, compact and handoff.",
  veil: "Recording mode: show emails, amounts, phone numbers and secrets as placeholders.",
  ward: "Ask before editing a file another session changed in the last half hour.",
  waypoints: "Suggest the next steps after each answer, one press each.",
};

export const ModNames: readonly (keyof EnabledMods)[] = ["commission", "resin", "veil", "ward", "waypoints"];
