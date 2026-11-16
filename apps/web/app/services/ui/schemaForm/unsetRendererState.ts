// A renderer's `enabled` and `readonly` defaulted to undefined, so a form that leaves them unset lets JSON Forms derive
// Them, where a boolean prop with no default would read as false. The defaults are typed `object` because vize's
// Generated `withDefaults` check has not taken Vue's own fix admitting an undefined default (vuejs/core#13594)
// @TODO: https://github.com/ubugeeei-prod/vize/issues/13179
export const unsetRendererState: object = { enabled: undefined, readonly: undefined };
