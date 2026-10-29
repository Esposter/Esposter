// The line that installs a tool on the platform the command runs on. A platform with no line written says so, rather
// than printing an empty next step
export const getInstallLine = (
  name: string,
  install: Partial<Record<NodeJS.Platform, string>>,
  platform: NodeJS.Platform,
): string => install[platform] ?? `no install line for ${platform}: install ${name} with its own installer`;
