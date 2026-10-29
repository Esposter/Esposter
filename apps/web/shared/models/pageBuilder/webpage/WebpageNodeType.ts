import { z } from "zod";

export enum WebpageNodeType {
  Button = "Button",
  Column = "Column",
  Columns = "Columns",
  Countdown = "Countdown",
  CustomHtml = "CustomHtml",
  Image = "Image",
  Map = "Map",
  Section = "Section",
  SurveyInvite = "SurveyInvite",
  Tab = "Tab",
  Tabs = "Tabs",
  Text = "Text",
  Tooltip = "Tooltip",
  TypedText = "TypedText",
  Video = "Video",
}

export const webpageNodeTypeSchema = z.enum(WebpageNodeType) satisfies z.ZodType<WebpageNodeType>;

export const WebpageNodeTypes = Object.values(WebpageNodeType);
