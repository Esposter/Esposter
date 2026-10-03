import type { PluginState } from "claude-code";

// Every state value's initial, read by each file's atoms: the engine traces a state reference only to an atom made in
// The file that uses it, so each file makes its own and this is the one place their initials are written
export const InitialState: PluginState["genshin-mods"] = {
  commission: { goal: "", openedAt: 0, tasks: [] },
  enabledMods: { commission: true, resin: true, veil: false, ward: true, waypoints: true },
  isCommissionExpanded: false,
  isHandingOff: false,
  lastCacheRequestAt: 0,
  lastPrompt: "",
  now: 0,
  waypoints: [],
};
