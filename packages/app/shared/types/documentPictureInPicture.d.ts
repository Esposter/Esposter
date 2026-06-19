// https://developer.chrome.com/docs/web-platform/document-picture-in-picture
// Ambient types for the Document Picture-in-Picture API (not yet in lib.dom).
interface DocumentPictureInPicture extends EventTarget {
  requestWindow: (options?: DocumentPictureInPictureOptions) => Promise<Window>;
  readonly window: null | Window;
}

interface DocumentPictureInPictureOptions {
  disallowReturnToOpener?: boolean;
  height?: number;
  preferInitialWindowPlacement?: boolean;
  width?: number;
}

interface Window {
  readonly documentPictureInPicture: DocumentPictureInPicture;
}
