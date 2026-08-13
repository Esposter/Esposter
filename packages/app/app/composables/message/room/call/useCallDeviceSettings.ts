import type { DeviceSection } from "@/models/message/room/call/DeviceSection";

import { getResultAsync, noop } from "@esposter/shared";
import { Room } from "livekit-client";

interface CallDeviceDefinition {
  kind: MediaDeviceKind;
  selectedId: Ref<string>;
  title: string;
}

export const useCallDeviceSettings = (definitions: CallDeviceDefinition[]) => {
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
  return { deviceSections, refreshDevices };
};
