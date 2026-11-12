import type { XmlFileSettings } from "#shared/models/resource/sheet/XmlFileSettings";

import { MimeType } from "#shared/models/file/MimeType";
import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { deserializeToDataSource } from "@/services/resource/sheet/dataSource/deserializeToDataSource";
import { getXmlRowCells } from "@/services/resource/sheet/xml/getXmlRowCells";
import { getXmlRowElements } from "@/services/resource/sheet/xml/getXmlRowElements";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const deserializeXml = async (file: File, _settings: XmlFileSettings) => {
  const text = await file.text();
  const xmlDocument = new DOMParser().parseFromString(text, MimeType.Xml);
  // The parser returns a document rather than throwing on bad markup, and it marks the failure as a parsererror element
  // In a namespace of its own, which differs by engine, so that namespace is read from a document the parser refuses
  // A cell the file names parsererror inherits the document's default namespace, so it is no failure
  const parserErrorNamespace = new DOMParser()
    .parseFromString("<", MimeType.Xml)
    .getElementsByTagName("parsererror")[0]?.namespaceURI;
  const parserError = [...xmlDocument.getElementsByTagName("parsererror")].find(
    ({ namespaceURI }) => namespaceURI === parserErrorNamespace,
  );
  // Chromium wraps the line and the cause in a div under its own headings, which are left out of the alert
  if (parserError)
    throw new InvalidOperationError(
      Operation.Read,
      file.name,
      (parserError.querySelector("div") ?? parserError).textContent ?? "",
    );
  // The parser fetches nothing external, but an internal entity can still expand a small file into a large one
  if (xmlDocument.doctype)
    throw new InvalidOperationError(
      Operation.Read,
      file.name,
      "a DOCTYPE is refused, since its entities can expand a small file into a large one",
    );
  const rowCells = getXmlRowElements(xmlDocument.documentElement).map((rowElement) =>
    getXmlRowCells(rowElement, file.name),
  );
  // A key first seen in a later row is a column too, so the columns are every name in first-seen order
  const sourceNames = [...new Set(rowCells.flatMap((cells) => [...cells.keys()]))];
  const bodyRows = rowCells.map((cells) => sourceNames.map((sourceName) => cells.get(sourceName) ?? ""));
  return deserializeToDataSource(sourceNames, bodyRows, DataSourceType.Xml, file);
};
