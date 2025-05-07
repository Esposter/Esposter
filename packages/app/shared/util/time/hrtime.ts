import { getIsServer } from "#shared/util/environment/getIsServer";

export const hrtime = (previousHrTime?: [number, number]): [number, number] => {
  if (getIsServer()) return process.hrtime(previousHrTime);
  const clocktime = performance.now() * 1e-3;
  let seconds = Math.floor(clocktime);
  let nanoseconds = Math.floor((clocktime % 1) * 1e9);
  if (previousHrTime) {
    seconds = seconds - previousHrTime[0];
    nanoseconds = nanoseconds - previousHrTime[1];
    if (nanoseconds < 0) {
      seconds--;
      nanoseconds += 1e9;
    }
  }
  return [seconds, nanoseconds];
};
