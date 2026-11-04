import type { SurveyNode } from "#src/models/SurveyNode";
import type { SurveyPageNode } from "#src/models/SurveyPageNode";
import type { SurveyRootProps } from "#src/models/SurveyRootProps";
import type { BlockDocument } from "headless-block-editor";

// The core's document of a survey: its pages, the only nodes the root accepts, and the root props the survey declares
export type SurveyDocument = BlockDocument<SurveyNode, SurveyRootProps, SurveyPageNode>;
