import { NODE_CLASS_PREFIX } from "#shared/services/pageBuilder/constants";

// The prefix keeps the class an identifier whatever character the id begins with
export const getNodeClass = (id: string) => `${NODE_CLASS_PREFIX}${id}`;
