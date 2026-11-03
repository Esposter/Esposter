import type { SurveyNode } from "#src/models/SurveyNode";
import type { SurveyRootProps } from "#src/models/SurveyRootProps";
import type { BlockDocument } from "headless-block-editor";

// The core's document of a survey: its pages and the root props the survey declares
export type SurveyDocument = BlockDocument<SurveyNode, SurveyRootProps>;
