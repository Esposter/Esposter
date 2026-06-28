import { execFileSync } from "node:child_process";

const wslPaths = new Map<string, string>();

export const readWslPath = (path: string): string => {
  const wslPath = wslPaths.get(path);
  if (wslPath) return wslPath;
  const newWslPath = execFileSync("wsl.exe", ["--exec", "wslpath", "-a", path], {
    encoding: "utf8",
    stdio: "pipe",
  }).trim();
  wslPaths.set(path, newWslPath);
  return newWslPath;
};
