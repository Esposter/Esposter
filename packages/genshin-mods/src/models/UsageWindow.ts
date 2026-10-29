export interface UsageWindow {
  // The window's length, which its reset time is counted back from
  durationMs: number;
  // The usage line the window's maintenance line starts at
  maintenancePercentage: number;
  // The window's name as the reserve's note spells it
  name: string;
}
