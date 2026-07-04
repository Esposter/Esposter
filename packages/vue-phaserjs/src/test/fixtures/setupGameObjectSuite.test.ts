/* eslint-disable vitest/require-top-level-describe */
import type { ComponentMountingOptions, VueWrapper } from "@vue/test-utils";

import { getTestPinia, removeTestScene } from "@/test/fixtures/headlessGame.test";
import { InjectionKeyMap } from "@/util/InjectionKeyMap";
import { mount } from "@vue/test-utils";
import { afterEach, describe } from "vitest";

export const setupGameObjectSuite = () => {
  const sceneKey = "sceneKey";
  let wrapper: undefined | VueWrapper;

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
