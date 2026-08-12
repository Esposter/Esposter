import { CSV_MIME_TYPE } from "@/services/resource/sheet/csv/constants.test";
import { describe } from "vitest";

export const createCsvFile = (content: BlobPart): File => new File([content], "a.csv", { type: CSV_MIME_TYPE });

describe.todo("createCsvFile");
