/* eslint-disable no-restricted-syntax -- the parity page's entry runs only in a browser, never under server rendering */
import type { WitnessView } from "#parity/witness/setWitnessView";
import type { SceneContext } from "#src/models/scene/SceneContext";
import type { SceneWitness } from "#src/models/scene/SceneWitness";

import "@fontsource/signika/600.css";
import { benchScene } from "#parity/benchScene";
import { readSceneFog } from "#parity/readSceneFog";
import { readSceneSky } from "#parity/readSceneSky";
import { renderMusic } from "#parity/renderMusic";
import { screens } from "#parity/screens";
import { setSceneCloudColors } from "#parity/setSceneCloudColors";
import { setSceneCloudCover } from "#parity/setSceneCloudCover";
import { setSceneLights } from "#parity/setSceneLights";
import { loadWitness } from "#parity/witness/loadWitness";
import { readWitnessParts } from "#parity/witness/readWitnessParts";
import { readWitnessPoints } from "#parity/witness/readWitnessPoints";
import { renderWitnessTargets } from "#parity/witness/renderWitnessTargets";
import { setWitnessView } from "#parity/witness/setWitnessView";
import { SceneContextKey } from "#src/services/scene/SceneContextKey";
import { SceneWitnessKey } from "#src/services/scene/SceneWitnessKey";
import { capitalize, jsonDateParse } from "@esposter/shared";

// One screen at a time, by `?screen=<Name>`, or the list of them. `&motion` asks for a motion held at its start for
// The tool that shoots it to set each moment: `entry` holds the screen's own animations as it mounts, and `props` lets
// Those finish, then applies the fixture's motion props and holds the transitions they start. `data-parity-ready`
// Marks the page drawn, holding the screen's name, or nothing for the list, so a name with no fixture is told apart.
// `&backdrop=<file>` draws that image under the screen, for an overlay shot over the frame it is judged against, and
// `&variant=<name>` renders the fixture's variant of that name, and `&witness=<layout>` draws a scene's exports in place
// Of its own parts, from the layout the shooting browser serves there. A tool sets the screen's props as it runs, to
// Play a motion at known moments, benches a scene's frames, and renders a segment of the login's music to score it
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
  const { component } = screen;
  // A reference judging the screen in another state than its fixture's hands its own props, as JSON, over the fixture's
  const referenceProps = searchParameters.get("props");
  const variant = searchParameters.get("variant");
  const props = reactive({
    ...screen.props,
    ...(variant ? screen.variants?.[variant] : {}),
    ...(referenceProps ? jsonDateParse<Record<string, unknown>>(referenceProps) : {}),
  });
  const backdrop = searchParameters.get("backdrop");
  // Drawn pixel for pixel, since it is scaled by the page's device ratio alone, so it matches its reference exactly
  if (backdrop)
    Object.assign(window.document.body.style, {
      background: `url("${backdrop}") center / 100% 100% no-repeat`,
      imageRendering: "pixelated",
    });
  const { promise: ready, resolve: resolveReady } = Promise.withResolvers<void>();
  const readyProps = screen.readyEvent ? { [`on${capitalize(screen.readyEvent)}`]: resolveReady } : {};
  if (!screen.readyEvent) resolveReady();
  const witnessLayoutUrl = searchParameters.get("witness");
  const witnessParts = witnessLayoutUrl ? await loadWitness(witnessLayoutUrl, screen.witnessFamilies) : null;
  const witness: null | SceneWitness = witnessParts
    ? {
        families: ref(witnessParts.children.map(({ name: family }) => family)),
        isAlone: ref(false),
        isClockHeld: ref(false),
        parts: witnessParts,
      }
    : null;
  const sceneContext = shallowRef<SceneContext>();
  createApp({
    setup: () => {
      /* oxlint-disable no-restricted-globals -- the parity page reaches a published scene's own parts with no prop for a host to see */
      provide(SceneContextKey, sceneContext);
      if (witness) provide(SceneWitnessKey, witness);
      /* oxlint-enable no-restricted-globals */
      return () => h(component, { ...props, ...readyProps });
    },
  }).mount(root);
  Reflect.set(window, "setScreenProps", (screenProps: Record<string, unknown>) => Object.assign(props, screenProps));
  Reflect.set(window, "benchScene", (frameCount: number) => benchScene(sceneContext.value, frameCount));
  Reflect.set(window, "readSceneSky", () => readSceneSky(sceneContext.value));
  Reflect.set(window, "readSceneFog", () => readSceneFog(sceneContext.value));
  Reflect.set(window, "renderMusic", renderMusic);
  Reflect.set(window, "setSceneCloudColors", (colors?: Parameters<typeof setSceneCloudColors>[1]) => {
    setSceneCloudColors(sceneContext.value, colors);
  });
  Reflect.set(window, "setSceneCloudCover", (covers?: Parameters<typeof setSceneCloudCover>[1]) =>
    setSceneCloudCover(sceneContext.value, covers),
  );
  Reflect.set(window, "setSceneLights", (shares: Parameters<typeof setSceneLights>[1]) =>
    setSceneLights(sceneContext.value, shares),
  );
  // The camera solve and the loss table set the witness's view from the shooting browser, one view a call
  if (witness) {
    Reflect.set(window, "setWitnessView", (view: WitnessView) => setWitnessView(witness, view));
    // Its G-buffer at the view last set, which the pose, the overlay, the layers' scores and calibration read
    Reflect.set(window, "renderWitnessTargets", (targets?: Parameters<typeof renderWitnessTargets>[2]) =>
      renderWitnessTargets(witness, sceneContext.value, targets),
    );
    // Each part of a family with where it lands on the screen, which a reference's landmarks are matched to
    Reflect.set(window, "readWitnessParts", (family: string) => readWitnessParts(witness, sceneContext.value, family));
    // Its landmarks' places in the world, which a pose is solved from
    Reflect.set(window, "readWitnessPoints", (landmarks: Parameters<typeof readWitnessPoints>[1]) =>
      readWitnessPoints(witness, landmarks),
    );
    // The families the witness draws, which the loss table hands back to the scene one at a time
    window.document.body.dataset.witnessFamilies = witness.families.value.join(",");
  }
  if (motion === "entry") holdAnimations();
  await window.document.fonts.ready;
  await ready;
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
