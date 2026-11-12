import type { PositionedDocument } from "#src/models/PositionedDocument";

import { ArrowheadKind } from "#src/models/ArrowheadKind";
import { ArrowPathKind } from "#src/models/ArrowPathKind";
import { CornerStyle } from "#src/models/CornerStyle";
import { DashPattern } from "#src/models/DashPattern";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { ShapeKind } from "#src/models/ShapeKind";
import { SketchLevel } from "#src/models/SketchLevel";
import { StrokeWidth } from "#src/models/StrokeWidth";
import { TextSize } from "#src/models/TextSize";
import { toPositionedSvg } from "#src/services/export/toPositionedSvg";
import { applyPositionedEdit } from "#src/services/positionedEdit.test";
import { updatePositionedElementProperty } from "#src/services/updatePositionedElementProperty";
import { ZERO_UUID } from "@esposter/shared";
import { assert, describe, expect, test } from "vitest";

const getAssetUrl = (fileId: string) => `/assets/${fileId}`;

describe(toPositionedSvg, () => {
  // Fixed ids rather than random ones: an element's hand-drawn outline is seeded from its id, so a random id would move the snapshot on every run
  const ARROW_ID = ZERO_UUID;
  const IMAGE_ID = "00000000-0000-4000-8000-000000000001";
  const PROCESS_ID = "00000000-0000-4000-8000-000000000002";
  const STICKY_NOTE_ID = "00000000-0000-4000-8000-000000000003";
  const STROKE_ID = "00000000-0000-4000-8000-000000000004";
  const TEXT_ID = "00000000-0000-4000-8000-000000000005";
  const WRAPPED_PROCESS_ID = "00000000-0000-4000-8000-000000000006";
  const FILE_ID = "0000000000000000000000000000000000000000000000000000000000000000";

  test("the whiteboard exports to SVG", () => {
    expect.hasAssertions();

    const positionedDocument: PositionedDocument = {
      elements: [
        {
          color: "",
          cornerStyle: CornerStyle.Sharp,
          dashPattern: DashPattern.Solid,
          fill: "#ffffff",
          height: 100,
          id: PROCESS_ID,
          kind: ShapeKind.Process,
          sketchLevel: SketchLevel.Artist,
          strokeWidth: StrokeWidth.Medium,
          text: "a",
          textSize: TextSize.Small,
          type: PositionedElementType.Shape,
          width: 100,
          x: 200,
          y: 0,
        },
        {
          color: "",
          dashPattern: DashPattern.Solid,
          end: { arrowhead: ArrowheadKind.Triangle, point: { x: 150, y: 250 } },
          id: ARROW_ID,
          label: "b",
          pathKind: ArrowPathKind.Straight,
          sketchLevel: SketchLevel.Artist,
          start: { binding: { connectionPointIndex: 2, elementId: PROCESS_ID }, point: { x: 50, y: 100 } },
          strokeWidth: StrokeWidth.Medium,
          textSize: TextSize.Small,
          type: PositionedElementType.Arrow,
        },
        {
          color: "",
          dashPattern: DashPattern.Solid,
          fill: "#ffff00",
          height: 80,
          id: STICKY_NOTE_ID,
          sketchLevel: SketchLevel.Artist,
          strokeWidth: StrokeWidth.Medium,
          text: "c",
          textSize: TextSize.Small,
          type: PositionedElementType.StickyNote,
          width: 80,
          x: 300,
          y: 300,
        },
        {
          color: "",
          id: STROKE_ID,
          points: [
            { x: 0, y: 200 },
            { x: 50, y: 250 },
          ],
          strokeWidth: StrokeWidth.Medium,
          type: PositionedElementType.Stroke,
        },
        {
          altText: "",
          fileId: FILE_ID,
          height: 50,
          id: IMAGE_ID,
          type: PositionedElementType.Image,
          width: 50,
          x: 100,
          y: 200,
        },
        {
          color: "",
          id: TEXT_ID,
          isWrapped: true,
          text: "d",
          textSize: TextSize.Small,
          type: PositionedElementType.Text,
          width: 100,
          x: 400,
          y: 0,
        },
        {
          color: "",
          cornerStyle: CornerStyle.Sharp,
          dashPattern: DashPattern.Solid,
          fill: "#ffffff",
          height: 100,
          id: WRAPPED_PROCESS_ID,
          kind: ShapeKind.Process,
          sketchLevel: SketchLevel.Artist,
          strokeWidth: StrokeWidth.Medium,
          text: "a b c d",
          textSize: TextSize.Small,
          type: PositionedElementType.Shape,
          width: 24,
          x: 0,
          y: 0,
        },
      ],
    };

    expect(toPositionedSvg(positionedDocument, getAssetUrl)).toMatchInlineSnapshot(
      `"<svg xmlns="http://www.w3.org/2000/svg" width="532" height="412" viewBox="-16 -16 532 412"><rect x="-16" y="-16" width="532" height="412" fill="#ffffff"/><path d="M200.35059769491227 0.3505976963092562 L300.35059903741376 0.35059903881074816 L300.35060037991525 100.35060038131223 L200.35060172241674 100.35060172381374 Z" fill="#ffffff" stroke="#1e1e1e" stroke-width="2"/><text x="250" y="55.333333333333336" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#1e1e1e"><tspan x="250" dy="0">a</tspan></text><path d="M50.34801740704478 100.34801740844176 L150.34801874954627 250.34801875094325" fill="none" stroke="#1e1e1e" stroke-width="2"/><polygon points="150,250 139.18334617360804,242.788897449072 147.50384911698646,237.24189548681971" fill="#1e1e1e"/><text x="100" y="180.33333333333334" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#1e1e1e"><tspan x="100" dy="0">b</tspan></text><path d="M300.35188783884604 300.351887840243 L380.35188918134753 300.3518891827445 L380.351890523849 380.351890525246 L300.3518918663505 380.3518918677475 Z" fill="#ffff00" stroke="#1e1e1e" stroke-width="2"/><text x="340" y="345.3333333333333" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#1e1e1e"><tspan x="340" dy="0">c</tspan></text><path d="M0 200 L50 250" fill="none" stroke="#1e1e1e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><image x="100" y="200" width="50" height="50" preserveAspectRatio="none" role="img" href="/assets/0000000000000000000000000000000000000000000000000000000000000000"/><text x="400" y="16" text-anchor="start" font-family="sans-serif" font-size="16" fill="#1e1e1e"><tspan x="400" dy="0">d</tspan></text><path d="M0.3557582706472642 0.35575827204424804 L24.355759613148756 0.35575961454574 L24.355760955650247 100.35576095704724 L0.3557622981517401 100.35576229954873 Z" fill="#ffffff" stroke="#1e1e1e" stroke-width="2"/><text x="12" y="45.333333333333336" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#1e1e1e"><tspan x="12" dy="0">a b</tspan><tspan x="12" dy="20">c d</tspan></text></svg>"`,
    );
  });

  test("a text and an asset url are written escaped, so neither can open markup", () => {
    expect.hasAssertions();

    const positionedDocument: PositionedDocument = {
      elements: [
        {
          color: "",
          id: TEXT_ID,
          isWrapped: true,
          text: '<a href="x">&',
          textSize: TextSize.Small,
          type: PositionedElementType.Text,
          width: 100,
          x: 0,
          y: 0,
        },
        {
          altText: '"&<',
          fileId: FILE_ID,
          height: 50,
          id: IMAGE_ID,
          type: PositionedElementType.Image,
          width: 50,
          x: 0,
          y: 50,
        },
      ],
    };

    expect(toPositionedSvg(positionedDocument, () => '/files/"&<')).toMatchInlineSnapshot(
      `"<svg xmlns="http://www.w3.org/2000/svg" width="132" height="132" viewBox="-16 -16 132 132"><rect x="-16" y="-16" width="132" height="132" fill="#ffffff"/><text x="0" y="16" text-anchor="start" font-family="sans-serif" font-size="16" fill="#1e1e1e"><tspan x="0" dy="0">&lt;a</tspan><tspan x="0" dy="20">href=&quot;x&quot;&gt;&amp;</tspan></text><image x="0" y="50" width="50" height="50" preserveAspectRatio="none" role="img" aria-label="&quot;&amp;&lt;" href="/files/&quot;&amp;&lt;"/></svg>"`,
    );
  });

  test("clearing alt text removes the name from the export", () => {
    expect.hasAssertions();

    const imageDocument: PositionedDocument = {
      elements: [
        {
          altText: "Quarterly chart",
          fileId: FILE_ID,
          height: 50,
          id: IMAGE_ID,
          type: PositionedElementType.Image,
          width: 50,
          x: 0,
          y: 0,
        },
      ],
    };
    const clearedDocument = applyPositionedEdit(
      imageDocument,
      updatePositionedElementProperty(imageDocument, 0, { property: "altText", value: "" }),
    );
    assert.exists(clearedDocument);

    expect(toPositionedSvg(imageDocument, getAssetUrl)).toMatchInlineSnapshot(
      `"<svg xmlns="http://www.w3.org/2000/svg" width="82" height="82" viewBox="-16 -16 82 82"><rect x="-16" y="-16" width="82" height="82" fill="#ffffff"/><image x="0" y="0" width="50" height="50" preserveAspectRatio="none" role="img" aria-label="Quarterly chart" href="/assets/0000000000000000000000000000000000000000000000000000000000000000"/></svg>"`,
    );
    expect(toPositionedSvg(clearedDocument, getAssetUrl)).toMatchInlineSnapshot(
      `"<svg xmlns="http://www.w3.org/2000/svg" width="82" height="82" viewBox="-16 -16 82 82"><rect x="-16" y="-16" width="82" height="82" fill="#ffffff"/><image x="0" y="0" width="50" height="50" preserveAspectRatio="none" role="img" href="/assets/0000000000000000000000000000000000000000000000000000000000000000"/></svg>"`,
    );
  });

  test("an empty whiteboard exports as its padding alone", () => {
    expect.hasAssertions();

    expect(toPositionedSvg({ elements: [] }, getAssetUrl)).toMatchInlineSnapshot(
      `"<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="-16 -16 32 32"><rect x="-16" y="-16" width="32" height="32" fill="#ffffff"/></svg>"`,
    );
  });
});
