import type { WebpageNode } from "#shared/models/pageBuilder/WebpageNode";

import { ButtonTarget } from "#shared/models/pageBuilder/ButtonTarget";
import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { PLACEHOLDER_MEDIA_URL } from "#shared/services/pageBuilder/constants";
import { createSurveyInviteProps } from "#shared/services/pageBuilder/createSurveyInviteProps";

const PLACEHOLDER_URL = "https://example.com/";
// The node a freshly inserted node of each type is, under the id the caller mints for it: each the smallest props its schema accepts,
// And each keyed by its type so the node it builds is the type it is keyed by
const webpageNodeDefaultsMap: { [K in WebpageNodeType]: (id: string) => Extract<WebpageNode, { type: K }> } = {
  [WebpageNodeType.Button]: (id) => ({
    props: { elementId: "", href: PLACEHOLDER_URL, id, label: "Button", target: ButtonTarget.SameTab },
    type: WebpageNodeType.Button,
  }),
  [WebpageNodeType.Column]: (id) => ({ props: { children: [], elementId: "", id }, type: WebpageNodeType.Column }),
  [WebpageNodeType.Columns]: (id) => ({ props: { children: [], elementId: "", id }, type: WebpageNodeType.Columns }),
  [WebpageNodeType.Countdown]: (id) => ({
    props: { elementId: "", endsAt: Temporal.Now.plainDateISO().toString(), endText: "", id },
    type: WebpageNodeType.Countdown,
  }),
  [WebpageNodeType.CustomHtml]: (id) => ({ props: { elementId: "", html: "", id }, type: WebpageNodeType.CustomHtml }),
  [WebpageNodeType.Image]: (id) => ({
    props: { alt: "Image", decorative: false, elementId: "", id, src: PLACEHOLDER_MEDIA_URL },
    type: WebpageNodeType.Image,
  }),
  [WebpageNodeType.Section]: (id) => ({
    props: { children: [], elementId: "", id, tag: HtmlTag.Section },
    type: WebpageNodeType.Section,
  }),
  [WebpageNodeType.SurveyInvite]: (id) => ({
    props: { ...createSurveyInviteProps(id), elementId: "" },
    type: WebpageNodeType.SurveyInvite,
  }),
  [WebpageNodeType.Tab]: (id) => ({
    props: { children: [], elementId: "", id, label: "Tab" },
    type: WebpageNodeType.Tab,
  }),
  [WebpageNodeType.Tabs]: (id) => ({ props: { children: [], elementId: "", id }, type: WebpageNodeType.Tabs }),
  [WebpageNodeType.Text]: (id) => ({
    props: { content: { content: [{ type: "paragraph" }], type: "doc" }, elementId: "", id },
    type: WebpageNodeType.Text,
  }),
  [WebpageNodeType.Tooltip]: (id) => ({
    props: { elementId: "", id, label: "Tooltip", text: "Tooltip" },
    type: WebpageNodeType.Tooltip,
  }),
  [WebpageNodeType.TypedText]: (id) => ({
    props: { elementId: "", id, texts: ["Text"] },
    type: WebpageNodeType.TypedText,
  }),
  [WebpageNodeType.Video]: (id) => ({
    props: { elementId: "", id, src: PLACEHOLDER_MEDIA_URL, title: "Video" },
    type: WebpageNodeType.Video,
  }),
};
// The node of the type a freshly inserted block is, under the id the caller mints for it
export const createWebpageNode = (type: WebpageNodeType, id: string): WebpageNode => webpageNodeDefaultsMap[type](id);
