import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { getResultAsync, noop } from "@esposter/shared";

interface UseDocumentPictureInPictureOptions {
  height?: number;
  width?: number;
}

const checkIsStyleNode = (node: Node): node is HTMLLinkElement | HTMLStyleElement =>
  node instanceof HTMLStyleElement || (node instanceof HTMLLinkElement && node.rel === "stylesheet");
// Resolves once the re-linked sheet has loaded (or errored, so one bad sheet can't stall forever)
// So callers can await every sheet before revealing content and avoid a flash of unstyled content.
const relinkStyleSheet = (target: Window, styleSheet: CSSStyleSheet) =>
  new Promise<void>((resolve) => {
    if (!styleSheet.href) {
      resolve();
      return;
    }
    const link = target.document.createElement("link");
    link.rel = "stylesheet";
    if (styleSheet.media.mediaText) link.media = styleSheet.media.mediaText;
    link.href = styleSheet.href;
    link.addEventListener(
      "load",
      () => {
        resolve();
      },
      { once: true },
    );
    link.addEventListener(
      "error",
      () => {
        resolve();
      },
      { once: true },
    );
    target.document.head.appendChild(link);
  });
// Linked sheets (those with an href) are re-linked, not inlined: their relative url(...) — e.g.
// The MDI @font-face — resolve against the CSS file's location, which inlining cssText into the
// PiP document would break (urls would resolve against the PiP base and 404 to index.html).
// Sheets without an href (Vuetify theme, UnoCSS runtime injected via insertRule, whose <style>
// `textContent` is empty) are rebuilt from their CSSOM rules so those rules carry over. These are
// Always inline <style>/constructed sheets, i.e. same-origin, so cssRules never throws.
const cloneStyleSheet = (target: Window, styleSheet: CSSStyleSheet) => {
  if (styleSheet.href) return relinkStyleSheet(target, styleSheet);
  const style = target.document.createElement("style");
  if (styleSheet.media.mediaText) style.media = styleSheet.media.mediaText;
  style.textContent = Array.from(styleSheet.cssRules, (rule) => rule.cssText).join("\n");
  target.document.head.appendChild(style);
  return Promise.resolve();
};

export const useDocumentPictureInPicture = (options: UseDocumentPictureInPictureOptions = {}) => {
  const isSupported = useSupported(() => "documentPictureInPicture" in window);
  const pictureInPictureWindow = shallowRef<Window>();
  let styleObserver: MutationObserver | undefined;
  const bridgeStyles = async (target: Window) => {
    const pendingSheets = [
      ...Array.from(window.document.styleSheets, (styleSheet) => cloneStyleSheet(target, styleSheet)),
      ...Array.from(window.document.adoptedStyleSheets, (styleSheet) => cloneStyleSheet(target, styleSheet)),
    ];
    // Vuetify scopes its theme variables (--v-theme-*) to the .v-theme--* class, so the PiP body
    // Must carry it for bg-background / theme colours to resolve. Only the theme class is copied —
    // Not the full .v-application className — to avoid pulling in its flex layout CSS.
    const themeClass = [...(window.document.querySelector(".v-application")?.classList ?? [])].find((className) =>
      className.startsWith("v-theme--"),
    );
    if (themeClass) target.document.body.classList.add(themeClass);
    // The root's attributes carry the theme: its class and style, and the data attributes the library's tokens and
    // Surface rules are keyed on: the mode, the design style and the readable-text setting
    for (const { name, value } of window.document.documentElement.attributes)
      target.document.documentElement.setAttribute(name, value);
    // The fresh PiP document has no layout height, so size-full content would collapse.
    target.document.documentElement.style.height = "100%";
    target.document.body.style.height = "100%";
    target.document.body.style.margin = "0";
    // Mirror late-added stylesheets (UnoCSS dev-time runtime injection) into the PiP document.
    styleObserver = new MutationObserver(
      getSynchronizedFunction((mutations) =>
        getResultAsync(async () => {
          for (const mutation of mutations)
            for (const node of mutation.addedNodes)
              if (checkIsStyleNode(node) && node.sheet) await cloneStyleSheet(target, node.sheet);
        }).match(noop, console.error),
      ),
    );
    styleObserver.observe(window.document.head, { childList: true });
    // Wait for re-linked sheets to finish loading so content isn't revealed before its CSS (FOUC).
    await Promise.all(pendingSheets);
  };
  const close = () => {
    styleObserver?.disconnect();
    styleObserver = undefined;
    pictureInPictureWindow.value?.close();
    pictureInPictureWindow.value = undefined;
  };
  const open = async () => {
    if (!isSupported.value || pictureInPictureWindow.value) return;
    await getResultAsync(() =>
      window.documentPictureInPicture.requestWindow({ height: options.height, width: options.width }),
    ).match(async (target) => {
      target.addEventListener(
        "pagehide",
        () => {
          close();
        },
        { once: true },
      );
      await bridgeStyles(target);
      // The window may have been closed while its stylesheets loaded; don't surface a dead window.
      if (target.closed) return;
      pictureInPictureWindow.value = target;
    }, noop);
  };

  tryOnScopeDispose(() => {
    close();
  });

  return { close, isSupported, open, pictureInPictureWindow };
};
