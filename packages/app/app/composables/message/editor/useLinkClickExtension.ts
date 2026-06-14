import type { CSSProperties } from "vue";

import { Extension } from "@tiptap/vue-3";
import { Plugin } from "prosemirror-state";
// Ctrl/Cmd-click opens links; holding the modifier shows a pointer cursor over the editor.
export const useLinkClickExtension = (cursorStyle: Ref<CSSProperties["cursor"]>) =>
  Extension.create<{ cursorStyle: Ref<CSSProperties["cursor"]> }>({
    addOptions() {
      return { cursorStyle };
    },
    addProseMirrorPlugins() {
      const { editor, options } = this;
      return [
        new Plugin({
          props: {
            handleClick(_view, _pos, event) {
              const isModifierPressed = event.ctrlKey || event.metaKey;
              if (!isModifierPressed) return false;

              const { href } = editor.getAttributes("link");
              if (!href) return false;

              window.open(href, "_blank", "noopener noreferrer");
              return true;
            },
            handleDOMEvents: {
              blur: () => {
                options.cursorStyle.value = "text";
                return false;
              },
              keydown: (_view, event) => {
                if (event.key === "Control" || event.key === "Meta") options.cursorStyle.value = "pointer";
                return false;
              },
              keyup: (_view, event) => {
                if (event.key === "Control" || event.key === "Meta") options.cursorStyle.value = "text";
                return false;
              },
            },
          },
        }),
      ];
    },
    name: "linkClick",
  });
