import { createScript } from "#src/services/genshinAssets/materials/createScript";
import { execFileSync } from "@esposter/shared-node/child-process";

export const disassembleWithD3d = (directory: string): number => {
  const output = execFileSync("powershell", ["-NoProfile", "-Command", createScript(directory)], {
    encoding: "utf8",
    maxBuffer: 1024 ** 2,
  });
  return Number(output.trim());
};
