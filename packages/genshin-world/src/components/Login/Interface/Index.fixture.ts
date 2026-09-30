import { LoginStage } from "#src/models/login/LoginStage";
import { LoginStatusStep } from "#src/models/login/LoginStatusStep";

// The interface alone over nothing, its title's stage with the welcome card up, and each later stage it is approved in.
// A reference shoots it over the English recording's own frame, so only the interface can differ
export const props = {
  isWelcomeShown: true,
  playerName: "Traveler",
  progress: 0,
  stage: LoginStage.Title,
  statusStep: LoginStatusStep.PreparingDownload,
};
export const variants = {
  arriving: { isSpinnerShown: true, isWelcomeShown: false, stage: LoginStage.Arriving },
  door: { isWelcomeShown: false, stage: LoginStage.Door },
  loadingData: {
    isWelcomeShown: false,
    progress: 0.2797,
    stage: LoginStage.Preparing,
    statusStep: LoginStatusStep.LoadingData,
  },
  loadingGame: { isWelcomeShown: false, stage: LoginStage.Preparing, statusStep: LoginStatusStep.LoadingGame },
};
