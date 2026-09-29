import { screens } from "#parity/screens";

// One screen at a time, by `?screen=<Name>`, or the list of them; `data-parity-ready` marks the page drawn for the
// Tool that shoots it
// eslint-disable-next-line no-restricted-syntax -- the parity page is plain Vite with no server render
const name = new URLSearchParams(window.location.search).get("screen");
const screen = screens.find((candidate) => candidate.name === name);
// eslint-disable-next-line no-restricted-syntax -- the parity page is plain Vite with no server render
const root = window.document.querySelector("#app");
if (screen && root) {
  const component = await screen.load();
  const app = createApp(component, screen.props);
  app.mount(root);
} else if (root)
  root.innerHTML = screens
    .map(({ name: screenName }) => `<a href="?screen=${screenName}">${screenName}</a>`)
    .join("<br>");
// eslint-disable-next-line no-restricted-syntax -- the parity page is plain Vite with no server render
await window.document.fonts.ready;
// eslint-disable-next-line no-restricted-syntax -- the parity page is plain Vite with no server render
window.document.body.dataset.parityReady = "";
