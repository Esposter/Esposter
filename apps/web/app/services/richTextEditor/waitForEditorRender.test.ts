import { describe } from "vitest";

// Tiptap's Vue editor re-renders what reads its state two frames after a transaction, a focus or a blur among them, as
// The frame nested in a frame its debounced state triggers from
export const waitForEditorRender = (): Promise<void> =>
  new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  });

describe.todo("waitForEditorRender");
