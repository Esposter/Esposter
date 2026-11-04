import type { PdfFreeText } from "#src/models/PdfFreeText";

import { err, ok, Result } from "neverthrow";

// An empty field is not a number, so a missing coordinate is caught rather than read as zero
const parseCoordinate = (text: string) => (text.trim() === "" ? Number.NaN : Number(text));
const checkRectangle = (coordinates: number[]): coordinates is [number, number, number, number] =>
  coordinates.length === 4 && coordinates.every((coordinate) => Number.isFinite(coordinate));

// The annotation at an index is named by its position where the file gives it no name
const readFreeText = (element: Element, index: number): Result<PdfFreeText, string> => {
  const page = element.getAttribute("page") ?? "";
  const coordinates = (element.getAttribute("rect") ?? "").split(",").map((text) => parseCoordinate(text));
  if (!/^\d+$/u.test(page)) return err(`Free text ${index + 1} has no valid page`);
  if (!checkRectangle(coordinates)) return err(`Free text ${index + 1} has no valid rect`);

  return ok({
    contents: element.querySelector("contents")?.textContent ?? "",
    id: element.getAttribute("name") ?? String(index),
    pageNumber: Number(page) + 1,
    rect: coordinates,
  });
};

// Reads the free-text annotations of an XFDF file. A file that cannot be read is an error naming the problem, and it
// Gives no annotations, so a caller that stops on the error changes nothing
export const readXfdf = (xfdf: string): Result<PdfFreeText[], string> => {
  const xfdfDocument = new DOMParser().parseFromString(xfdf, "application/xml");
  if (xfdfDocument.querySelector("parsererror")) return err("The XFDF is not well-formed XML");

  return Result.combine(
    Array.from(xfdfDocument.querySelectorAll("freetext"), (element, index) => readFreeText(element, index)),
  );
};
