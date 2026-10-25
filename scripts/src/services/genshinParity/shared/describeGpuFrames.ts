import type { GpuPass } from "#src/models/genshinParity/shared/GpuPass";

import { getQueuedMs } from "#src/services/genshinParity/shared/getQueuedMs";
import { roundMs } from "#src/services/genshinParity/shared/roundMs";

const GPU_FRAMES_BEFORE_STALL = 3;

// The GPU's time on a stalled frame's passes and on the frames before it, each with how long the GPU left them queued
// After their submit and its heaviest pass, so a stall waiting on a backlog is named by the work that built it
export const describeGpuFrames = (passes: GpuPass[], frameIndex: number, offsetMs: number): string[] =>
  Array.from({ length: GPU_FRAMES_BEFORE_STALL + 1 }, (_value, offset) => frameIndex - GPU_FRAMES_BEFORE_STALL + offset)
    .map((frame) => passes.filter((pass) => pass.frame === frame))
    .filter((framePasses) => framePasses.length > 0)
    .map((framePasses) => {
      const heaviest = framePasses.toSorted((firstPass, secondPass) => secondPass.gpuMs - firstPass.gpuMs)[0];
      const gpuMs = framePasses.reduce((total, pass) => total + pass.gpuMs, 0);
      const queuedMs = framePasses.reduce((most, pass) => Math.max(most, getQueuedMs(pass, offsetMs)), 0);
      return `  gpu frame #${heaviest?.frame}: ${roundMs(gpuMs)} ms in ${framePasses.length} passes, begun up to ${roundMs(queuedMs)} ms after submit, heaviest ${roundMs(heaviest?.gpuMs ?? 0)} ms ${heaviest?.label} | ${heaviest?.detail}`;
    });
