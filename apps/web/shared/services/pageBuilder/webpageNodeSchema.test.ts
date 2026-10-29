import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { StyleBreakpoint } from "#shared/models/pageBuilder/StyleBreakpoint";
import { StyleState } from "#shared/models/pageBuilder/StyleState";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { NO_SURVEY_ID } from "#shared/services/pageBuilder/constants";
import { createButton } from "#shared/services/pageBuilder/createButton.test";
import { webpageNodeSchema } from "#shared/services/pageBuilder/webpageNodeSchema";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("webpageNodeSchema", () => {
  const STYLE = { [StyleBreakpoint.Base]: { [StyleState.Default]: { color: "#333" } } };

  test("a stored webpage parses under the static node schema", () => {
    expect.hasAssertions();

    // One node of every webpage type, each holding the props the editors store, its style included
    const result = z.array(webpageNodeSchema).safeParse([
      {
        props: { href: "https://example.com/", id: "button", label: "Button", style: STYLE },
        type: WebpageNodeType.Button,
      },
      {
        props: {
          endsAt: Temporal.Instant.fromEpochMilliseconds(0).toZonedDateTimeISO("UTC").toPlainDate().toString(),
          endText: "",
          id: "countdown",
          style: STYLE,
        },
        type: WebpageNodeType.Countdown,
      },
      { props: { html: "", id: "custom-html", style: STYLE }, type: WebpageNodeType.CustomHtml },
      {
        props: { alt: "Image", decorative: false, id: "image", src: "https://example.com/", style: STYLE },
        type: WebpageNodeType.Image,
      },
      {
        props: {
          children: [
            {
              props: {
                children: [{ props: { children: [], id: "column", style: STYLE }, type: WebpageNodeType.Column }],
                id: "columns",
                style: STYLE,
              },
              type: WebpageNodeType.Columns,
            },
            {
              props: {
                children: [
                  { props: { children: [], id: "tab", label: "Tab", style: STYLE }, type: WebpageNodeType.Tab },
                ],
                id: "tabs",
                style: STYLE,
              },
              type: WebpageNodeType.Tabs,
            },
          ],
          id: "section",
          style: STYLE,
          tag: HtmlTag.Section,
        },
        type: WebpageNodeType.Section,
      },
      {
        props: { id: "survey-invite", label: "Survey", style: STYLE, surveyId: NO_SURVEY_ID },
        type: WebpageNodeType.SurveyInvite,
      },
      {
        props: { content: { content: [{ type: "paragraph" }], type: "doc" }, id: "text", style: STYLE },
        type: WebpageNodeType.Text,
      },
      { props: { id: "tooltip", label: "Tooltip", style: STYLE, text: "Tooltip" }, type: WebpageNodeType.Tooltip },
      { props: { id: "typed-text", style: STYLE, texts: ["Text"] }, type: WebpageNodeType.TypedText },
      {
        props: { id: "video", src: "https://example.com/", style: STYLE, title: "Video" },
        type: WebpageNodeType.Video,
      },
    ]);

    expect(result.success).toBe(true);
  });

  test("an id that closes the published stylesheet is refused", () => {
    expect.hasAssertions();

    // The id names the node's class inside the published <style>, so this one closes it and opens a script
    const result = webpageNodeSchema.safeParse(createButton("x}</style><script>"));

    expect(result.success).toBe(false);
  });

  test("a UUID id is accepted, the form a minted node id takes", () => {
    expect.hasAssertions();

    const result = webpageNodeSchema.safeParse(createButton(crypto.randomUUID()));

    expect(result.success).toBe(true);
  });
});
