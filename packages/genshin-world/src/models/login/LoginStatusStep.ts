// What the foot of the login screen says while the game prepares: the download's line is shown over its share once the
// Download has bytes to fetch, and the last is the one the progress bar is shown under
export const LoginStatusStep = {
  CheckingForUpdates: "CheckingForUpdates",
  Downloading: "Downloading",
  LoadingData: "LoadingData",
  LoadingGame: "LoadingGame",
  PreparingDownload: "PreparingDownload",
} as const;
export type LoginStatusStep = (typeof LoginStatusStep)[keyof typeof LoginStatusStep];
