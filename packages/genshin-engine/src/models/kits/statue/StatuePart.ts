import type { StatueStack } from "#src/models/kits/statue/StatueStack";

// One stack of a statue's part, its part the export part its sections came from, which names its material
export interface StatuePart extends StatueStack {
  part: string;
}
