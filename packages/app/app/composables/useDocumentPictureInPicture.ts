import { getResultAsync, noop } from "@esposter/shared";

export interface UseDocumentPictureInPictureOptions {
  height?: number;
  width?: number;
}

const isStyleNode = (node: Node): node is HTMLLinkElement | HTMLStyleElement =>
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
// TextContent is empty) are rebuilt from their CSSOM rules so those rules carry over. These are
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
  const pipWindow = shallowRef<null | Window>(null);
  let styleObserver: MutationObserver | undefined;
  const bridgeStyles = async (target: Window) => {
    const pendingSheets = [
      ...Array.from(document.styleSheets, (styleSheet) => cloneStyleSheet(target, styleSheet)),
      ...Array.from(document.adoptedStyleSheets, (styleSheet) => cloneStyleSheet(target, styleSheet)),
    ];
    // Vuetify scopes its theme variables (--v-theme-*) to the .v-theme--* class, so the PiP body
    // Must carry it for bg-background / theme colours to resolve. Only the theme class is copied —
    // Not the full .v-application className — to avoid pulling in its flex layout CSS.
    const themeClass = [...(document.querySelector(".v-application")?.classList ?? [])].find((className) =>
      className.startsWith("v-theme--"),
    );
    if (themeClass) target.document.body.classList.add(themeClass);
    target.document.documentElement.className = document.documentElement.className;
    const rootStyle = document.documentElement.getAttribute("style");
    if (rootStyle) target.document.documentElement.setAttribute("style", rootStyle);
    // The fresh PiP document has no layout height, so size-full content would collapse.
    target.document.documentElement.style.height = "100%";
    target.document.body.style.height = "100%";
    target.document.body.style.margin = "0";
    // Mirror late-added stylesheets (UnoCSS dev-time runtime injection) into the PiP document.
    styleObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations)
        for (const node of mutation.addedNodes)
          if (isStyleNode(node) && node.sheet) cloneStyleSheet(target, node.sheet);
    });
    styleObserver.observe(document.head, { childList: true });
    // Wait for re-linked sheets to finish loading so content isn't revealed before its CSS (FOUC).
    await Promise.all(pendingSheets);
  };
  const close = () => {
    styleObserver?.disconnect();
    styleObserver = undefined;
    pipWindow.value?.close();
    pipWindow.value = null;
  };
  const open = async () => {
    if (!isSupported.value || pipWindow.value) return;
    await getResultAsync(() =>
      window.documentPictureInPicture.requestWindow({ height: options.height, width: options.width }),
    ).match(async (target) => {
      target.addEventListener("pagehide", close, { once: true });
      await bridgeStyles(target);
      // The window may have been closed while its stylesheets loaded; don't surface a dead window.
      if (target.closed) return;
      pipWindow.value = target;
    }, noop);
  };

  tryOnScopeDispose(close);

  return { close, isSupported, open, pipWindow };
};
