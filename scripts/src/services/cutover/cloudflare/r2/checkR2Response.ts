import type { Operation } from "@esposter/shared";

import { readXmlElement } from "#src/services/cutover/cloudflare/r2/readXmlElement";
import { InvalidOperationError } from "@esposter/shared";

// Throws for an answer that is not 2xx, naming S3's error Code. The message carries the status and the code only.
// It never carries the request, which holds the signature
export const checkR2Response = async (response: Response, operation: Operation, name: string): Promise<void> => {
  if (response.ok) return;
  const code = readXmlElement(await response.text(), "Code");
  throw new InvalidOperationError(
    operation,
    name,
    code === "" ? `answered ${response.status}` : `answered ${response.status} ${code}`,
  );
};
