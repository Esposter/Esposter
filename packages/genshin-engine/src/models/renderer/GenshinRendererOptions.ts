// What the browser lets the renderer ask of it, read by the caller, so the engine reads no navigator
export interface GenshinRendererOptions {
  // Whether the browser honours a request for the discrete GPU, which Windows does not: it chooses by the system's own
  // Setting there
  honoursPowerPreference: boolean;
}
