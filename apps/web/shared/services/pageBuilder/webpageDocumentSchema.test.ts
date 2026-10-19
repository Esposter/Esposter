import { SectionTag } from "#shared/models/pageBuilder/SectionTag";
import { StyleBreakpoint } from "#shared/models/pageBuilder/StyleBreakpoint";
import { StyleState } from "#shared/models/pageBuilder/StyleState";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { MAX_WEBPAGE_NODES } from "#shared/services/pageBuilder/constants";
import { TEST_ID, TEST_OTHER_ID, TEST_ROOT } from "#shared/services/pageBuilder/constants.test";
import { createButton } from "#shared/services/pageBuilder/createButton.test";
import { webpageDocumentSchema } from "#shared/services/pageBuilder/webpageDocumentSchema";
import { describe, expect, test } from "vitest";

const NO_SURVEY_ID = "00000000-0000-0000-0000-000000000000";
const STYLE = { [StyleBreakpoint.Base]: { [StyleState.Default]: { color: "#333" } } };

describe("webpageDocumentSchema", () => {
  test("a document with a duplicate node id is refused", () => {
    expect.hasAssertions();

    const result = webpageDocumentSchema.safeParse({
      content: [createButton(TEST_ID), createButton(TEST_ID)],
      root: TEST_ROOT,
    });

    expect(result.error?.issues.map(({ message, path }) => ({ message, path }))).toStrictEqual([
      { message: "repeats an id", path: ["content", 1, "props", "id"] },
    ]);
  });

  test("a document over the node limit is refused", () => {
    expect.hasAssertions();

    const result = webpageDocumentSchema.safeParse({
      content: Array.from({ length: MAX_WEBPAGE_NODES + 1 }, (_value, index) => createButton(`${index}`)),
      root: TEST_ROOT,
    });

    expect(result.error?.issues.map(({ message, path }) => ({ message, path }))).toStrictEqual([
      { message: `holds more than ${MAX_WEBPAGE_NODES} nodes`, path: ["content"] },
    ]);
  });

  test("a document with distinct node ids is accepted", () => {
    expect.hasAssertions();

    expect(
      webpageDocumentSchema.safeParse({
        content: [createButton(TEST_ID), createButton(TEST_OTHER_ID)],
        root: TEST_ROOT,
      }).success,
    ).toBe(true);
  });

  test("a stored webpage parses under the typed schema", () => {
    expect.hasAssertions();

    // One node of every webpage type, each holding the props the editors store, its style included
    const result = webpageDocumentSchema.safeParse({
      content: [
        {
          props: { href: "https://example.com/", id: "button", label: "Button", style: STYLE },
          type: WebpageNodeType.Button,
        },
        {
          props: {
            endText: "",
            endsAt: Temporal.Instant.fromEpochMilliseconds(0).toZonedDateTimeISO("UTC").toPlainDate().toString(),
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
            tag: SectionTag.Section,
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
      ],
      root: TEST_ROOT,
    });

    expect(result.success).toBe(true);
  });

  test("a prop the type does not declare is refused by name", () => {
    expect.hasAssertions();

    const result = webpageDocumentSchema.safeParse({
      content: [{ props: { ...createButton(TEST_ID).props, undeclared: "value" }, type: WebpageNodeType.Button }],
      root: TEST_ROOT,
    });

    expect(result.error?.issues.map(({ message, path }) => ({ message, path }))).toStrictEqual([
      { message: 'Unrecognized key: "undeclared"', path: ["content", 0, "props"] },
    ]);
  });
});
