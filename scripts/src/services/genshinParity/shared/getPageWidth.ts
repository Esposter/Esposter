import { INTERFACE_HEIGHT } from "#src/services/genshinParity/shared/constants";

// The width a witness page is opened at. A World screen's canvas is never drawn below the interface's height, however
// Short its page is, so a page shorter than the interface draws its witness targets at the interface's full height
// While its screenshot and its reference come out at the page's own size, and the two are combined pixel for pixel.
// Such a page is opened at least as tall as the interface, at its reference's aspect; any other screen's page is opened
// At the width asked
export const getPageWidth = ({
  isWorldScreen,
  referenceHeight,
  referenceWidth,
  requestedWidth,
}: {
  isWorldScreen: boolean;
  referenceHeight: number;
  referenceWidth: number;
  requestedWidth: number;
}): number => {
  if (!isWorldScreen) return requestedWidth;
  const interfaceWidth = Math.round((INTERFACE_HEIGHT * referenceWidth) / referenceHeight);
  return Math.max(requestedWidth, interfaceWidth);
};
