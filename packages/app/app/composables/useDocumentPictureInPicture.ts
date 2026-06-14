import { getResultAsync, noop } from "@esposter/shared";

export interface UseDocumentPictureInPictureOptions {
  height?: number;
  width?: number;
}

const isStyleNode = (node: Node): node is HTMLLinkElement | HTMLStyleElement =>
  node instanceof HTMLStyleElement || (node instanceof HTMLLinkElement && node.rel === "stylesheet");
const copyStyleNode = (target: Window, node: HTMLLinkElement | HTMLStyleElement) => {
  target.document.head.appendChild(node.cloneNode(true));
};

export const useDocumentPictureInPicture = (options: UseDocumentPictureInPictureOptions = {}) => {
  const isSupported = useSupported(() => "documentPictureInPicture" in window);
  const pipWindow = shallowRef<null | Window>(null);
  const isActive = computed(() => Boolean(pipWindow.value));
  let styleObserver: MutationObserver | undefined;
  const bridgeStyles = (target: Window) => {
    for (const node of document.head.querySelectorAll("style, link[rel='stylesheet']"))
      if (isStyleNode(node)) copyStyleNode(target, node);
    target.document.adoptedStyleSheets = [...document.adoptedStyleSheets];
    target.document.documentElement.className = document.documentElement.className;
    const rootStyle = document.documentElement.getAttribute("style");
    if (rootStyle) target.document.documentElement.setAttribute("style", rootStyle);
    target.document.body.style.margin = "0";
    // Mirror late-added stylesheets (UnoCSS dev-time runtime injection) into the PiP document.
    styleObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations)
        for (const node of mutation.addedNodes) if (isStyleNode(node)) copyStyleNode(target, node);
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

  return { close, isActive, isSupported, open, pipWindow };
};
