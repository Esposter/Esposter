import { getResult, getResultAsync, noop } from "@esposter/shared";

export interface UseDocumentPictureInPictureOptions {
  height?: number;
  width?: number;
}

const isStyleNode = (node: Node): node is HTMLLinkElement | HTMLStyleElement =>
  node instanceof HTMLStyleElement || (node instanceof HTMLLinkElement && node.rel === "stylesheet");
// Rebuild each sheet from its CSSOM rules so rules injected via insertRule (Vuetify theme,
// UnoCSS runtime) — which have empty textContent — are carried over, not just inline <style> text.
const cloneStyleSheet = (target: Window, styleSheet: CSSStyleSheet) => {
  getResult(() => {
    const style = target.document.createElement("style");
    if (styleSheet.media.mediaText) style.media = styleSheet.media.mediaText;
    style.textContent = Array.from(styleSheet.cssRules, (rule) => rule.cssText).join("\n");
    target.document.head.appendChild(style);
  }).match(noop, () => {
    // Cross-origin sheet: cssRules access throws, so re-link instead of inlining.
    if (!styleSheet.href) return;
    const link = target.document.createElement("link");
    link.rel = "stylesheet";
    if (styleSheet.media.mediaText) link.media = styleSheet.media.mediaText;
    link.href = styleSheet.href;
    target.document.head.appendChild(link);
  });
};

export const useDocumentPictureInPicture = (options: UseDocumentPictureInPictureOptions = {}) => {
  const isSupported = useSupported(() => "documentPictureInPicture" in window);
  const pipWindow = shallowRef<null | Window>(null);
  let styleObserver: MutationObserver | undefined;
  const bridgeStyles = (target: Window) => {
    for (const styleSheet of document.styleSheets) cloneStyleSheet(target, styleSheet);
    for (const styleSheet of document.adoptedStyleSheets) cloneStyleSheet(target, styleSheet);
    // Vuetify scopes its theme variables (--v-theme-*) to the .v-theme--* class, so the PiP body
    // must carry it for bg-background / theme colours to resolve. Only the theme class is copied —
    // not the full .v-application className — to avoid pulling in its flex layout CSS.
    const themeClass = Array.from(document.querySelector(".v-application")?.classList ?? []).find((className) =>
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
    ).match((target) => {
      bridgeStyles(target);
      target.addEventListener("pagehide", close, { once: true });
      pipWindow.value = target;
    }, noop);
  };

  tryOnScopeDispose(close);

  return { close, isSupported, open, pipWindow };
};
