import { checkIsDeepEqual } from "@esposter/shared";

// Writes the next value to a field only while the field still holds what the write sent. An edit the reader made while
// The Write was out is theirs, so it is kept, and the answer replaces only what was sent
export const applyIfUnchanged = <TValue>(field: Ref<TValue>, sent: TValue, next: TValue) => {
  if (checkIsDeepEqual(field.value, sent)) field.value = next;
};
