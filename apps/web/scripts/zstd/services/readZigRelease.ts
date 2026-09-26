import { ZIG_INDEX_URL, ZIG_VERSION } from "@@/scripts/zstd/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { z } from "zod";

const zigReleaseSchema = z.object({ shasum: z.string(), tarball: z.url() });
// Zig names a platform architecture-first and in its own words, which node spells differently
const ZigArchitectureMap: Partial<Record<NodeJS.Architecture, string>> = { arm64: "aarch64", x64: "x86_64" };
const ZigPlatformMap: Partial<Record<NodeJS.Platform, string>> = { darwin: "macos", linux: "linux", win32: "windows" };

export const readZigRelease = async () => {
  const architecture = ZigArchitectureMap[process.arch] ?? process.arch;
  const platform = ZigPlatformMap[process.platform] ?? process.platform;
  const platformKey = `${architecture}-${platform}`;
  const response = await fetch(ZIG_INDEX_URL);
  const releases = z.record(z.string(), z.record(z.string(), z.unknown())).parse(await response.json());
  const release = releases[ZIG_VERSION]?.[platformKey];
  if (!release) throw new InvalidOperationError(Operation.Read, ZIG_VERSION, `no zig release for ${platformKey}`);
  return zigReleaseSchema.parse(release);
};
