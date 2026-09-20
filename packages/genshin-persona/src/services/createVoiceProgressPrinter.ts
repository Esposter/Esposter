import type { VoiceProgress } from "#src/models/VoiceProgress";

const PROGRESS_STATUS = "progress";
// A weight is the better part of a gigabyte, and a verb that sits silent through it looks hung
const PRINTED_PERCENTAGE_STEP = 10;
const MAX_PERCENTAGE = 100;

// One line per step of each file the runtime fetches, and nothing for a file read from the cache, whose first
// Report is already complete
export const createVoiceProgressPrinter = (): ((progress: VoiceProgress) => void) => {
  const printedPercentages = new Map<string, number>();
  return ({ file, progress, status }) => {
    if (status !== PROGRESS_STATUS || !file || progress === undefined) return;

    const percentage = Math.floor(progress / PRINTED_PERCENTAGE_STEP) * PRINTED_PERCENTAGE_STEP;
    const isCached = !printedPercentages.has(file) && percentage >= MAX_PERCENTAGE;
    if (isCached || printedPercentages.get(file) === percentage) return;

    printedPercentages.set(file, percentage);
    console.log(`${file} ${percentage}%`);
  };
};
