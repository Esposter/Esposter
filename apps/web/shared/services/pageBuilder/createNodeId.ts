import { NODE_ID_LENGTH } from "#shared/services/pageBuilder/constants";
import { createId } from "#shared/util/math/random/createId";

export const createNodeId = () => createId(NODE_ID_LENGTH);
