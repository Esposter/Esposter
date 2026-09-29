import { screens } from "#parity/screens";

// One screen at a time, by `?screen=<Name>`, or the list of them; `data-parity-ready` marks the page drawn for the
// Tool that shoots it
const name = new URLSearchParams(window.location.search).get("screen");
const screen = screens.find((candidate) => candidate.name === name);
const root = window.document.querySelector("#app");
if (screen && root) {
  const component = await screen.load();
  const app = createApp(component, screen.props);
  app.mount(root);
} else if (root)
  root.innerHTML = screens
    .map(({ name: screenName }) => `<a href="?screen=${screenName}">${screenName}</a>`)
    .join("<br>");
await window.document.fonts.ready;
window.document.body.dataset.parityReady = "";
