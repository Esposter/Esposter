// A span of a kit module's text a probe wraps, so the sites within it are read each time it is evaluated: a function a
// Behaviour runs, or a call that makes one
export interface KitModuleRegistration {
  end: number;
  siteIds: string[];
  start: number;
}
