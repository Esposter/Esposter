import { InvalidOperationError, Operation } from "@esposter/shared";

// The page's WebGPU device, requested once and shared by every statistic read on the page
let device: Promise<GPUDevice> | undefined;

export const getSurfaceStatisticsDevice = (): Promise<GPUDevice> => {
  device ??= (async () => {
    const adapter = await window.navigator.gpu.requestAdapter({ powerPreference: "high-performance" });
    if (!adapter) throw new InvalidOperationError(Operation.Read, "WebGPU adapter", "none on the parity page");
    return adapter.requestDevice();
  })();
  return device;
};
