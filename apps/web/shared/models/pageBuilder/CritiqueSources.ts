import type { SrgbColor } from "#shared/models/pageBuilder/SrgbColor";
import type { StyleValue } from "#shared/models/pageBuilder/StyleValue";
import type { SurveyPublishState } from "#shared/models/pageBuilder/SurveyPublishState";

// What the critique reads from its caller, so the function touches neither the DOM nor the database: each colour a style sets,
// As an sRGB colour or nothing where it cannot be read, and each survey's publish state
export interface CritiqueSources {
  lookupSurveyPublishState: (surveyId: string) => SurveyPublishState;
  readColor: (value: StyleValue) => SrgbColor | undefined;
}
