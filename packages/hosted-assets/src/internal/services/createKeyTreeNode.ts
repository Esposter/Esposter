import type { KeyTree } from "#src/internal/models/KeyTree";

// A node has no prototype, so a segment such as `constructor` or `__proto__` is a key of its own rather than an
// Inherited member
export const createKeyTreeNode = (): KeyTree => Object.create(null);
