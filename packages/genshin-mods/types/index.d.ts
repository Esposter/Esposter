// The plugin's state contract, the one self-contained file the engine validates the module's `$.state` keys against,
// So the value types the modules share are declared here too
export interface Commission {
  goal: string;
  openedAt: number;
  tasks: CommissionTask[];
}

export interface CommissionTask {
  id: string;
  status: "completed" | "in_progress" | "pending";
  subject: string;
}

// Which mods are on, each switched by its own command and kept in the store as one record
export interface EnabledMods {
  commission: boolean;
  pulse: boolean;
  resin: boolean;
  sins: boolean;
  veil: boolean;
  ward: boolean;
  waypoints: boolean;
}

// The rate-limit window past a usage line, named as its section spells it, the line it has passed, whether that line is
// The wind-down rather than the maintenance tier, whether the tier was entered by spending ahead of an even pace rather
// Than by the window's maintenance line, and when it resets; `""` in the name is the absent reserve
export interface ReserveWindow {
  isAheadOfPace: boolean;
  isWindDown: boolean;
  name: string;
  percentage: number;
  resetsAt: string;
}

// What the sins mod last found: its scores when the call answered, or why it could not score the last prompt
export type SinStatus = "answered" | "failed" | "no-key" | "node-too-old" | "unchecked";

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
      lookupStreak: number;
      now: number;
      reserveWindow: ReserveWindow;
      // Keyed by sin name, the last evidence values of each sin in order
      sinHistory: Record<string, number[]>;
      sinSession: number;
      sinStatus: SinStatus;
      waypoints: string[];
    };
  }
}
