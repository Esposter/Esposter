import { SECONDS_PER_DAY, SECONDS_PER_MINUTE } from "#src/services/machine/constants";

// A `ps` CPU time, `[[dd-]hh:]mm:ss[.cc]`, in seconds
export const parseCpuTime = (time: string): number => {
  const [days, clock] = time.includes("-") ? time.split("-") : ["0", time];
  const seconds = (clock ?? "").split(":").reduce((total, part) => total * SECONDS_PER_MINUTE + Number(part), 0);
  return Number(days) * SECONDS_PER_DAY + seconds;
};
