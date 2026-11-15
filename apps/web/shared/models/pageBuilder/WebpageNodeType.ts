// Each node type a webpage holds, named by the type tag its node carries in the document
export const WebpageNodeType = {
  Button: "Button",
  Column: "Column",
  Columns: "Columns",
  Countdown: "Countdown",
  CustomHtml: "CustomHtml",
  Image: "Image",
  Section: "Section",
  SurveyInvite: "SurveyInvite",
  Tab: "Tab",
  Tabs: "Tabs",
  Text: "Text",
  Tooltip: "Tooltip",
  TypedText: "TypedText",
  Video: "Video",
} as const;
export type WebpageNodeType = (typeof WebpageNodeType)[keyof typeof WebpageNodeType];
