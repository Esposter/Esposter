import type { SurveyConditionAnswer } from "@/models/resource/survey/SurveyConditionAnswer";
import type { SurveyNode } from "headless-survey-engine";

// A node holding an answer has a name and a title. A page and a panel have no name, and a text block and an image have
// No title, so neither is an answer
export const toSurveyConditionAnswer = (node: SurveyNode): SurveyConditionAnswer | undefined => {
  if (!("name" in node.props) || !("title" in node.props)) return undefined;

  return { name: node.props.name, title: node.props.title, type: node.type };
};
