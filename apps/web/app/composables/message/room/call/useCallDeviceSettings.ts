import type { CallDeviceDefinition } from "#src/models/message/room/call/CallDeviceDefinition";
import type { DeviceSection } from "#src/models/message/room/call/DeviceSection";

import { MediaDeviceKindMetadataMap } from "#src/services/message/room/call/MediaDeviceKindMetadataMap";
import { getLocalDevices } from "#src/services/message/room/realtime/getLocalDevices";
import { getResultAsync, noop } from "@esposter/shared";

// The menu is owned here because the device list is only worth enumerating while it is open — a device plugged
// In with the menu shut has to appear the next time it opens
export const useCallDeviceSettings = (definitions: CallDeviceDefinition[]) => {
  const isMenuOpen = ref(false);
  const deviceMap = ref(new Map<MediaDeviceKind, MediaDeviceInfo[]>());
  const deviceSections = computed<DeviceSection[]>(() =>
    definitions.map(({ kind, selectedId }) => ({
      devices: deviceMap.value.get(kind) ?? [],
      kind,
      selectedId: selectedId.value,
      title: MediaDeviceKindMetadataMap[kind].title,
    })),
  );
  const refreshDevices = async () => {
    await getResultAsync(async () => {
      const devices = await Promise.all(
        definitions.map(async ({ kind }) => ({ devices: await getLocalDevices(kind), kind })),
      );
      for (const { devices: newDevices, kind } of devices) deviceMap.value.set(kind, newDevices);
    }).match(noop, console.error);
  };
  watch(isMenuOpen, async (newIsMenuOpen) => {
    if (newIsMenuOpen) await refreshDevices();
  });

  return { deviceSections, isMenuOpen };
};
