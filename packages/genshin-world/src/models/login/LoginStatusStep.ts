// What the foot of the login screen says while the game prepares: the last is the one the progress bar is shown under
export const LoginStatusStep = {
  CheckingForUpdates: "CheckingForUpdates",
  LoadingData: "LoadingData",
  LoadingGame: "LoadingGame",
  PreparingDownload: "PreparingDownload",
} as const;
export type LoginStatusStep = (typeof LoginStatusStep)[keyof typeof LoginStatusStep];
