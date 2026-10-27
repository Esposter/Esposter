import { GpuFigureLabel } from "#src/models/machine/GpuFigureLabel";

// The name a GPU figure carries, by the platform whose reader took it: Windows' typeperf counter sums the 3D engine's
// Queues alone, while macOS's ioreg Device Utilization is the whole GPU's busy time, compute passes included, so one
// Label would claim the two machines measure the same thing
export const GpuFigureLabelMap: Partial<Record<NodeJS.Platform, string>> = {
  [GpuFigureLabel.Darwin]: "GPU",
  [GpuFigureLabel.Win32]: "GPU 3D",
};
