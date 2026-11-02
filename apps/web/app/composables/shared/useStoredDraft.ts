import { checkIsDeepEqual } from "@esposter/shared";

// A form's draft over a value the store holds, for a form whose save writes that value back. The draft shows the stored
// Value until the reader edits it, so a change another client made reaches a form the reader has not touched. An edit
// Stays the reader's until the stored value has caught up with it: a save that landed leaves the two equal, while a
// Refused save rolls the stored value back, so the entered value stands for the retry. `normalize` gives the form a value
// Is saved in, which is compared in place of the value when the server saves something other than what was typed, so an
// Entry that saves to the stored value is no edit
export const useStoredDraft = <T>(stored: () => T, normalize: (value: T) => unknown = (value) => value) => {
  const edited = ref<T>();
  const draft = computed<T>({
    get: () => (edited.value === undefined ? stored() : edited.value),
    set: (value) => {
      edited.value = value;
    },
  });
  const isSaved = (value: T) => checkIsDeepEqual(normalize(value), normalize(stored()));
  const isDirty = computed(() => edited.value !== undefined && !isSaved(edited.value));
  // Called once a save has answered, when the stored value is the one that save left
  const settle = () => {
    if (edited.value !== undefined && isSaved(edited.value)) edited.value = undefined;
  };
  const reset = () => {
    edited.value = undefined;
  };
  return { draft, isDirty, reset, settle };
};
