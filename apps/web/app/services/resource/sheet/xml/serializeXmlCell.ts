import { escapeXml } from "#shared/util/text/escapeXml";
import { XML_CELL_ELEMENT_NAME, XML_NAME_REGEX } from "@/services/resource/sheet/xml/constants";

// XML 1.0 holds no control character but tab, newline and carriage return, nor the two noncharacters ending the plane, so they are
// Dropped as the XFDF writer drops them. A carriage return is written as its reference, since a reader folds a bare one
// Into a newline and the text would not come back as it went
const toXmlText = (value: string) =>
  escapeXml(
    // oxlint-disable-next-line no-control-regex -- the control characters XML 1.0 forbids are what this drops
    value.replaceAll(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/gu, ""),
  ).replaceAll("\r", "&#13;");

// A name that is a valid XML name is the element's own name. Any other rides on a cell element as an attribute, and
// The attribute is quoted, so its quotes are escaped on top of the text escape the cell's text gets, and a tab or a
// Newline is written as its reference, since a reader folds each raw one into a space
export const serializeXmlCell = (columnName: string, cellText: string) => {
  const text = toXmlText(cellText);
  if (XML_NAME_REGEX.test(columnName)) return `<${columnName}>${text}</${columnName}>`;

  const attributeValue = toXmlText(columnName)
    .replaceAll('"', "&quot;")
    .replaceAll("\t", "&#9;")
    .replaceAll("\n", "&#10;");
  return `<${XML_CELL_ELEMENT_NAME} name="${attributeValue}">${text}</${XML_CELL_ELEMENT_NAME}>`;
};
