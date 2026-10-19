import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";

// A UUID that names no survey, the one value a survey invite's id takes until its author chooses a survey
const NO_SURVEY_ID = "00000000-0000-0000-0000-000000000000";
const PLACEHOLDER_URL = "https://example.com/";

// The props a freshly inserted node of each type holds besides its id, each the smallest value its props schema accepts
const webpageNodeDefaultsMap: Record<WebpageNodeType, (id: string) => Record<string, unknown>> = {
  [WebpageNodeType.Button]: (id) => ({ href: PLACEHOLDER_URL, id, label: "Button" }),
  [WebpageNodeType.Column]: (id) => ({ children: [], id }),
  [WebpageNodeType.Columns]: (id) => ({ children: [], id }),
  [WebpageNodeType.Countdown]: (id) => ({ endText: "", endsAt: Temporal.Now.plainDateISO().toString(), id }),
  [WebpageNodeType.CustomHtml]: (id) => ({ html: "", id }),
  [WebpageNodeType.Image]: (id) => ({ alt: "Image", decorative: false, id, src: PLACEHOLDER_URL }),
  [WebpageNodeType.Section]: (id) => ({ children: [], id, tag: HtmlTag.Section }),
  [WebpageNodeType.SurveyInvite]: (id) => ({ id, label: "Survey", surveyId: NO_SURVEY_ID }),
  [WebpageNodeType.Tab]: (id) => ({ children: [], id, label: "Tab" }),
  [WebpageNodeType.Tabs]: (id) => ({ children: [], id }),
  [WebpageNodeType.Text]: (id) => ({ content: { content: [{ type: "paragraph" }], type: "doc" }, id }),
  [WebpageNodeType.Tooltip]: (id) => ({ id, label: "Tooltip", text: "Tooltip" }),
  [WebpageNodeType.TypedText]: (id) => ({ id, texts: ["Text"] }),
  [WebpageNodeType.Video]: (id) => ({ id, src: PLACEHOLDER_URL, title: "Video" }),
};

// The props a node of the type holds when it is first inserted, under the id the caller mints for it
export const createWebpageNodeProps = (type: WebpageNodeType, id: string): Record<string, unknown> =>
  webpageNodeDefaultsMap[type](id);
