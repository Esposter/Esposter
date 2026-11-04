import type { PdfFreeText } from "#src/models/PdfFreeText";

import { err, ok, Result } from "neverthrow";

// An empty field is not a number, so a missing coordinate is caught rather than read as zero
const parseCoordinate = (text: string) => (text.trim() === "" ? Number.NaN : Number(text));
const checkRectangle = (coordinates: number[]): coordinates is [number, number, number, number] =>
  coordinates.length === 4 && coordinates.every((coordinate) => Number.isFinite(coordinate));

// A free text keeps its name as its id unless the name is empty or already held, and then it takes an id of its own, so
// No free text replaces another that holds the same id
const readFreeText = (element: Element, index: number, usedIds: Set<string>): Result<PdfFreeText, string> => {
  const page = element.getAttribute("page") ?? "";
  const coordinates = (element.getAttribute("rect") ?? "").split(",").map((text) => parseCoordinate(text));
  if (!/^\d+$/u.test(page)) return err(`Free text ${index + 1} has no valid page`);
  if (!checkRectangle(coordinates)) return err(`Free text ${index + 1} has no valid rect`);
  // The renderer stores no editor whose text is blank, so a free text with none is refused rather than dropped on its page
  const contents = element.querySelector("contents")?.textContent ?? "";
  if (contents.trim() === "") return err(`Free text ${index + 1} has no contents`);

  const name = element.getAttribute("name") ?? "";
  const id = name === "" || usedIds.has(name) ? crypto.randomUUID() : name;
  usedIds.add(id);

  return ok({ contents, id, pageNumber: Number(page) + 1, rect: coordinates });
};

// Reads the free-text annotations of an XFDF file. The ids already held in the document are passed in, so a free text
// Named as one of them takes an id of its own. A file that cannot be read is an error naming the problem, and it gives no
// Annotations, so a caller that stops on the error changes nothing
export const readXfdf = (xfdf: string, takenIds: ReadonlySet<string>): Result<PdfFreeText[], string> => {
  const xfdfDocument = new DOMParser().parseFromString(xfdf, "application/xml");
  if (xfdfDocument.querySelector("parsererror")) return err("The XFDF is not well-formed XML");

  const usedIds = new Set(takenIds);

  return Result.combine(
    Array.from(xfdfDocument.querySelectorAll("freetext"), (element, index) => readFreeText(element, index, usedIds)),
  );
};
