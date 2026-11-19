import { UiDialogSizeClassMap } from "#src/services/ui/UiDialogSizeClassMap";
import { describe } from "vitest";

// The size classes a dialog element draws, each read from the one map every size is named by
export const getDialogSizeClasses = (dialogClasses: string[]) =>
  Object.values(UiDialogSizeClassMap).filter((sizeClass) => dialogClasses.includes(sizeClass));

describe.todo("getDialogSizeClasses");
