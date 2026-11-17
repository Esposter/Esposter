// A renderer's `enabled` and `readonly` defaulted to undefined, so a form that leaves them unset lets JSON Forms derive
// Them, where a boolean prop with no default would read as false
export const unsetRendererState = { enabled: undefined, readonly: undefined };
