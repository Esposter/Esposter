// A tool found by the file it leaves on each platform, for one with no command on the PATH, such as a browser
export interface SetupFileTool {
  install: Partial<Record<NodeJS.Platform, string>>;
  name: string;
  paths: Partial<Record<NodeJS.Platform, string>>;
}
