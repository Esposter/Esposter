import { MAX_WEBPAGE_NODES } from "#shared/services/pageBuilder/constants";
import { webpageRegistry } from "#shared/services/pageBuilder/webpageRegistry";
import { createBlockDocumentSchema } from "headless-block-editor";

// A webpage document, refused on a duplicate id, a node a slot does not allow, props its type refuses, or too many nodes
export const webpageDocumentSchema = createBlockDocumentSchema(webpageRegistry, MAX_WEBPAGE_NODES);
