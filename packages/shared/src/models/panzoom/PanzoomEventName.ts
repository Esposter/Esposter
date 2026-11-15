// The custom events a panzoom dispatches on its element, each carrying a PanzoomEventDetail
export const PanzoomEventName = {
  Change: "panzoomchange",
  End: "panzoomend",
  Pan: "panzoompan",
  Reset: "panzoomreset",
  Start: "panzoomstart",
  Zoom: "panzoomzoom",
} as const;
export type PanzoomEventName = (typeof PanzoomEventName)[keyof typeof PanzoomEventName];
