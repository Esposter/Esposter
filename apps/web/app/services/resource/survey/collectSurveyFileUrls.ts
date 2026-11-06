import type { SurveyDocument, SurveyNode } from "vue-survey-engine-headless";

import { surveyNodeChildren, SurveyNodeType } from "vue-survey-engine-headless";

// The pictures a node holds of its own: an image's, and each choice's of an image picker
const getOwnFileUrls = (node: SurveyNode): string[] => {
  if (node.type === SurveyNodeType.Image) return [node.props.imageLink];
  else if (node.type === SurveyNodeType.ImagePicker) return node.props.choices.map(({ imageLink }) => imageLink);

  return [];
};

// The pictures of the nodes, down through every slot, so one inside a panel or a dynamic panel's template is found too
const collectNodeFileUrls = (nodes: readonly SurveyNode[]): string[] =>
  nodes.flatMap((node) => [
    ...getOwnFileUrls(node),
    ...Object.values(surveyNodeChildren(node)).flatMap((childNodes) => collectNodeFileUrls(childNodes)),
  ]);

// The urls of every file a survey references, its logo included: each once and sorted, without the empty ones a
// Question with no picture holds, so a comparison of two documents' files is a comparison of two lists
export const collectSurveyFileUrls = (document: SurveyDocument): string[] => {
  const urls = [document.root.props.logo, ...collectNodeFileUrls(document.content)];
  return [...new Set(urls)]
    .filter((url) => url !== "")
    .toSorted((firstUrl, secondUrl) => Number(firstUrl > secondUrl) - Number(firstUrl < secondUrl));
};
