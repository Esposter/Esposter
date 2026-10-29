import type { SetupProbe } from "#src/models/setup/SetupProbe";

// A tool found by running it, with the line that installs it on each platform
export interface SetupCommandTool {
  install: Partial<Record<NodeJS.Platform, string>>;
  name: string;
  probe: SetupProbe;
}
