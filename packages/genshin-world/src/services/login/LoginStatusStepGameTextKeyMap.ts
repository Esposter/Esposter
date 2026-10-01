import { LoginStatusStep } from "#src/models/login/LoginStatusStep";
import { GameTextKey } from "genshin-text";

// What the foot of the login screen says at each step
export const LoginStatusStepGameTextKeyMap: Record<LoginStatusStep, GameTextKey> = {
  [LoginStatusStep.CheckingForUpdates]: GameTextKey.LoginCheckingForUpdates,
  [LoginStatusStep.LoadingData]: GameTextKey.LoginLoadingData,
  [LoginStatusStep.LoadingGame]: GameTextKey.LoginLoadingGame,
  [LoginStatusStep.PreparingDownload]: GameTextKey.LoginPreparingDownload,
};
