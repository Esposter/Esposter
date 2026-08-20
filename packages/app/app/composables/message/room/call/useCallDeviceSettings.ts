import type { DeviceSection } from "@/models/message/room/call/DeviceSection";

import { getResultAsync, noop } from "@esposter/shared";
import { Room } from "livekit-client";

interface CallDeviceDefinition {
  kind: MediaDeviceKind;
  selectedId: Ref<string>;
  title: string;
}

// The menu is owned here rather than by each settings button, because the list is only worth enumerating while
// It is on screen: a device plugged in with the menu shut has to appear when it next opens, and every caller
// Getting that right separately is how one of them ends up showing a stale list
export const useCallDeviceSettings = (definitions: CallDeviceDefinition[]) => {
  const menu = ref(false);
  const deviceMap = ref(new Map<MediaDeviceKind, MediaDeviceInfo[]>());
  const deviceSections = computed<DeviceSection[]>(() =>
    definitions.map(({ kind, selectedId, title }) => ({
      devices: deviceMap.value.get(kind) ?? [],
      kind,
      selectedId: selectedId.value,
      title,
    })),
  );
  const refreshDevices = async () => {
    await getResultAsync(async () => {
      const devices = await Promise.all(
        definitions.map(async ({ kind }) => ({
          devices: await Room.getLocalDevices(kind),
          kind,
        })),
      );
      for (const { devices: newDevices, kind } of devices) deviceMap.value.set(kind, newDevices);
    }).match(noop, console.error);
  };
  watch(menu, async (newMenu) => {
    if (!newMenu) return;
    await refreshDevices();
  });

  return { deviceSections, menu };
};
