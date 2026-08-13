import { JSON_MIME_TYPE } from "@/services/resource/sheet/json/constants.test";
import { describe } from "vitest";

export const createJsonFile = (content: BlobPart): File => new File([content], "a.json", { type: JSON_MIME_TYPE });

describe.todo("createJsonFile");
