import type { SurveyPublishState } from "#shared/models/pageBuilder/SurveyPublishState";
import type { SrgbColor } from "#shared/models/shared/SrgbColor";

// What the critique reads from its caller, so the function touches neither the DOM nor the database: each colour a
// Style sets, as an sRGB colour or nothing where it cannot be read, and each survey's publish state
export interface CritiqueSources {
  lookupSurveyPublishState: (surveyId: string) => SurveyPublishState;
  readColor: (value: string) => SrgbColor | undefined;
}
