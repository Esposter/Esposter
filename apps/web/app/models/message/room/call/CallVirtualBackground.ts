// The preset a user's virtual background setting names. The value is stored, so it is the name, never the url: the url is
// The bundle's, and a rebuild changes it. Each member's value is its key, and the order is the picker's
/* eslint-disable perfectionist/sort-objects -- The picker lists the presets in the order they are declared */
export const CallVirtualBackground = {
  Sunrise: "Sunrise",
  Forest: "Forest",
  Aurora: "Aurora",
  Studio: "Studio",
} as const;
export type CallVirtualBackground = (typeof CallVirtualBackground)[keyof typeof CallVirtualBackground];
/* eslint-enable perfectionist/sort-objects */
