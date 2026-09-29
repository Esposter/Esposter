/* eslint-disable no-restricted-syntax -- the parity page's entry runs only in a browser, never under server rendering */
import { screens } from "#parity/screens";

// One screen at a time, by `?screen=<Name>`, or the list of them. `&motion` asks for a motion held at its start for
// The tool that shoots it to set each moment: `entry` holds the screen's own animations as it mounts, and `props` lets
// Those finish, then applies the fixture's motion props and holds the transitions they start. `data-parity-ready`
// Marks the page drawn, holding the screen's name, or nothing for the list, so a name with no fixture is told apart
const holdAnimations = (): void => {
  // Reading the animations resolves the styles that start them, and a held one stays listed once it would have ended
  for (const animation of window.document.getAnimations()) animation.pause();
};
const searchParameters = new URLSearchParams(window.location.search);
const name = searchParameters.get("screen");
const motion = searchParameters.get("motion");
const screen = screens.find((candidate) => candidate.name === name);
const root = window.document.querySelector("#app");
if (screen && root) {
  const component = await screen.load();
  const props = reactive({ ...screen.props });
  createApp({ render: () => h(component, props) }).mount(root);
  if (motion === "entry") holdAnimations();
  await window.document.fonts.ready;
  if (motion === "props" && screen.motionProps) {
    await Promise.all(window.document.getAnimations().map(({ finished }) => finished));
    // A style flush now records the entry's end as the state the motion transitions from; without one the browser folds
    // The ended entry and the new props into one style change and starts no transition at all
    window.document.body.getBoundingClientRect();
    Object.assign(props, screen.motionProps);
    await nextTick();
    holdAnimations();
  }
} else if (root)
  root.innerHTML = screens
    .map(({ name: screenName }) => `<a href="?screen=${screenName}">${screenName}</a>`)
    .join("<br>");
window.document.body.dataset.parityReady = screen?.name ?? "";
