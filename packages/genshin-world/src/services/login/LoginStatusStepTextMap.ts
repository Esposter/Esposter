import { LoginStatusStep } from "#src/models/login/LoginStatusStep";

// What the foot of the login screen says at each step, in the English client's words
export const LoginStatusStepTextMap: Record<LoginStatusStep, string> = {
  [LoginStatusStep.CheckingForUpdates]: "Checking for updates...",
  [LoginStatusStep.LoadingData]: "Preparing to load data",
  [LoginStatusStep.LoadingGame]: "Loading game...",
  [LoginStatusStep.PreparingDownload]: "Preparing to download resources",
};
