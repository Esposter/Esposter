import { MILLISECONDS_PER_MINUTE } from "#src/services/fleet/constants";

const MINUTES_PER_HOUR = 60;

// How long ago a refresh was, in the coarsest unit a status table reads at a glance
export const formatAge = (milliseconds: number): string => {
  const minutes = Math.floor(milliseconds / MILLISECONDS_PER_MINUTE);
  if (minutes < MINUTES_PER_HOUR) return `${minutes} min`;
  return `${Math.floor(minutes / MINUTES_PER_HOUR)} h`;
};
