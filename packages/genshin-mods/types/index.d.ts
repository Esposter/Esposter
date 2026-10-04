// The plugin's state contract, the one self-contained file the engine validates the module's `$.state` keys against,
// So the value types the modules share are declared here too
export interface Commission {
  goal: string;
  openedAt: number;
  tasks: CommissionTask[];
}

export interface CommissionTask {
  id: string;
  // oxlint-disable-next-line literal-union/no-string-literal-union -- The engine's own task statuses, as its task tools spell them
  status: "completed" | "in_progress" | "pending";
  subject: string;
}

// Which mods are on, each switched by its own command and kept in the store as one record
export interface EnabledMods {
  commission: boolean;
  resin: boolean;
  veil: boolean;
  ward: boolean;
  waypoints: boolean;
}

export interface WardRecord {
  editedAt: number;
  sessionId: string;
}

declare module "claude-code" {
  interface PluginState {
    "genshin-mods": {
      commission: Commission;
      enabledMods: EnabledMods;
      isCommissionExpanded: boolean;
      isHandingOff: boolean;
      lastCacheRequestAt: number;
      lastPrompt: string;
      now: number;
      waypoints: string[];
    };
  }
}
