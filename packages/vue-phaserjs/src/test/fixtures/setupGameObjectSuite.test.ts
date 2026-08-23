import type { ComponentMountingOptions, VueWrapper } from "@vue/test-utils";

import { getTestPinia, removeTestScene } from "#src/test/fixtures/headlessGame.test";
import { InjectionKeyMap } from "#src/util/InjectionKeyMap";
import { mount } from "@vue/test-utils";
import { afterEach, describe } from "vitest";
// Mount returns a wrapper typed against the concrete component instance, which is not assignable
// To the default VueWrapper<ComponentPublicInstance>; teardown only ever needs unmount.
type UnmountableWrapper = Pick<VueWrapper, "unmount">;

export const setupGameObjectSuite = () => {
  const sceneKey = "sceneKey";
  let wrapper: undefined | UnmountableWrapper;

  const mountGameObject = <TComponent extends Component>(
    component: TComponent,
    options?: ComponentMountingOptions<TComponent>,
  ) => {
    const mountedWrapper = mount(component, {
      ...options,
      global: { plugins: [getTestPinia()], provide: { [InjectionKeyMap.SceneKey]: sceneKey } },
    });
    wrapper = mountedWrapper;
    return mountedWrapper;
  };

  const unmountGameObject = () => {
    wrapper?.unmount();
    wrapper = undefined;
  };

  afterEach(() => {
    unmountGameObject();
    removeTestScene(sceneKey);
  });

  return { mountGameObject, sceneKey, unmountGameObject };
};

describe.todo("setupGameObjectSuite");
