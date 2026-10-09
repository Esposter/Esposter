// The capability a platform name stands for, or undefined for a platform the fleet has no name for
export const getOperatingSystemCapability = (platform: string): string | undefined => {
  switch (platform) {
    case "darwin":
      return "macos";
    case "linux":
      return "linux";
    case "win32":
      return "windows";
    default:
      return undefined;
  }
};
