import type { LatheSection } from "genshin-engine";

// A tower kind's shape in shares of its shaft's diameter: the sections of its head from its shaft up, and, for a
// Crowned one, the ring of columns standing on them under its last sections
export interface LoginTowerProfile {
  colonnade?: { columnCount: number; columnRadius: number; height: number; ringRadius: number };
  // The sections over the colonnade, from its top up
  crownSections: LatheSection[];
  // The sections under the colonnade, or all of them without one, from the shaft up
  headSections: LatheSection[];
  isFaceted: boolean;
  // The mouldings banding the shaft below the head: every this many diameters, this thick and this wide in radius
  ring: { interval: number; radius: number; thickness: number };
}
