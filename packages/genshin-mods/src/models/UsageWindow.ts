export interface UsageWindow {
  // The usage line the window's maintenance tier starts at, left out by a window with no maintenance tier
  maintenancePercentage?: number;
  // The window's name as the reserve's note spells it
  name: string;
  // The usage line the window's wind-down starts at
  windDownPercentage: number;
}
