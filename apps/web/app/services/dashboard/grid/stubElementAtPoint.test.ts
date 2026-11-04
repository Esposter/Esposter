import { describe, onTestFinished } from "vitest";

// A DOM without layout has no hit test, so the element under a release is the one the test names, as a browser would
export const stubElementAtPoint = (element: Element) => {
  document.elementsFromPoint = () => [element];
  onTestFinished(() => {
    Reflect.deleteProperty(document, "elementsFromPoint");
  });
};

describe.todo("stubElementAtPoint");
