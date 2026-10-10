export interface UsageWindow {
  // The usage line the window's maintenance tier starts at
  maintenancePercentage: number;
  // The window's name as the reserve's note spells it
  name: string;
  // The usage line the window's wind-down starts at
  windDownPercentage: number;
}
