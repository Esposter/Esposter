import type { CpuCapture } from "#src/models/genshinParity/shared/CpuCapture";

export const describeFunction = (node: CpuCapture["nodes"][number]): string => {
  const { functionName, lineNumber, url } = node.callFrame;
  const place = url ? `${url.split("/").slice(-2).join("/")}:${lineNumber}` : "native";

  return `${functionName || "(anonymous)"} ${place}`;
};
