import { XML_MIME_TYPE } from "@/services/resource/sheet/xml/constants.test";
import { describe } from "vitest";

export const createXmlFile = (content: BlobPart): File => new File([content], "a.xml", { type: XML_MIME_TYPE });

describe.todo("createXmlFile");
