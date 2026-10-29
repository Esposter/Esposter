import type { DevValue, DevVariable } from "genshin-world";

// A variable and the value it held when the registry last changed, which is what the panel's control shows
export interface DevReading {
  value: DevValue;
  variable: DevVariable;
}
