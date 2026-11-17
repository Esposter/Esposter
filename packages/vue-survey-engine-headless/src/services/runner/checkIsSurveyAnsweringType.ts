import { SurveyNodeType } from "#src/models/SurveyNodeType";

// The kinds that hold no value of a response: a page and a panel are containers, and a block of markup or a picture holds no answer
// A calculated value is not among them, since a completed response carries its value even though no respondent gives it
const NON_ANSWERING_NODE_TYPES = new Set<SurveyNodeType>([
  SurveyNodeType.Html,
  SurveyNodeType.Image,
  SurveyNodeType.Page,
  SurveyNodeType.Panel,
]);

// A kind a response holds a value for, which an editor offering kinds of question reads before any node of it exists
export const checkIsSurveyAnsweringType = (type: SurveyNodeType): boolean => !NON_ANSWERING_NODE_TYPES.has(type);
