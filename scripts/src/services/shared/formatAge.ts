import { MILLISECONDS_PER_MINUTE } from "#src/services/shared/constants";

const MINUTES_PER_HOUR = 60;

// How long ago a refresh was, in the coarsest unit a status table reads at a glance. A stamp a machine's clock puts ahead
// Of the reader's reads as no age at all, not a negative one
export const formatAge = (milliseconds: number): string => {
  const minutes = Math.max(0, Math.floor(milliseconds / MILLISECONDS_PER_MINUTE));
  if (minutes < MINUTES_PER_HOUR) return `${minutes} min`;
  return `${Math.floor(minutes / MINUTES_PER_HOUR)} h`;
};
