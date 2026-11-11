import type { MimeType } from "#shared/models/file/MimeType";
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { XmlFileSettings } from "#shared/models/resource/sheet/XmlFileSettings";

import { getCellTextRows } from "@/services/resource/sheet/commands/getCellTextRows";
import { XML_ROOT_ELEMENT_NAME, XML_ROW_ELEMENT_NAME } from "@/services/resource/sheet/xml/constants";
import { serializeXmlCell } from "@/services/resource/sheet/xml/serializeXmlCell";
import { takeOne } from "@esposter/shared";

export const serializeXml = (dataSource: DataSource, _settings: XmlFileSettings, mimeType: MimeType) => {
  const rowLines = getCellTextRows(dataSource.columns, dataSource.rows).map((cellTexts) => {
    const cells = cellTexts.map((cellText, index) =>
      serializeXmlCell(takeOne(dataSource.columns, index).name, cellText),
    );
    return `<${XML_ROW_ELEMENT_NAME}>${cells.join("")}</${XML_ROW_ELEMENT_NAME}>`;
  });
  const xmlText = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<${XML_ROOT_ELEMENT_NAME}>`,
    ...rowLines,
    `</${XML_ROOT_ELEMENT_NAME}>`,
  ].join("\n");
  return Promise.resolve(new Blob([xmlText], { type: mimeType }));
};
