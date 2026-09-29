/* eslint-disable no-restricted-syntax -- the parity page's entry runs only in a browser, never under server rendering */
import { screens } from "#parity/screens";

// One screen at a time, by `?screen=<Name>`, or the list of them. A fixture's motion props are applied two frames
// After mounting, once its first state is painted, so the transition they start runs from its first frame;
// Every animation is then held at its start, and `data-parity-ready` marks the page for the tool that shoots it,
// Holding the screen's name, or nothing for the list, so a name with no fixture is told apart
const name = new URLSearchParams(window.location.search).get("screen");
const screen = screens.find((candidate) => candidate.name === name);
const root = window.document.querySelector("#app");
if (screen && root) {
  const component = await screen.load();
  const props = reactive({ ...screen.props });
  createApp({ render: () => h(component, props) }).mount(root);
  await window.document.fonts.ready;
  if (screen.motionProps) {
    await new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          resolve();
        });
      });
    });
    Object.assign(props, screen.motionProps);
    await nextTick();
    // Held at its first frame: reading the animations resolves the styles that start them, and the shooter then sets
    // Each one's time, which it could not do once a short one had finished and left the list
    for (const animation of window.document.getAnimations()) animation.pause();
  }
} else if (root)
  root.innerHTML = screens
    .map(({ name: screenName }) => `<a href="?screen=${screenName}">${screenName}</a>`)
    .join("<br>");
window.document.body.dataset.parityReady = screen?.name ?? "";
