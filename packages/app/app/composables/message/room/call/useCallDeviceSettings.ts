import type { DeviceSection } from "@/models/message/room/call/DeviceSection";

import { readDevices } from "@/services/message/room/liveKit/readDevices";
import { useLiveKitStore } from "@/store/message/room/liveKit";
import { getResultAsync, noop } from "@esposter/shared";

interface CallDeviceDefinition {
  kind: MediaDeviceKind;
  selectedId: Ref<string>;
  title: string;
}

export const useCallDeviceSettings = (definitions: CallDeviceDefinition[]) => {
  const liveKitStore = useLiveKitStore();
  const { switchDevice } = liveKitStore;
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
          devices: await readDevices(kind),
          kind,
        })),
      );
      for (const { devices: newDevices, kind } of devices) deviceMap.value.set(kind, newDevices);
    }).match(noop, console.error);
  };
  const selectDevice = async (kind: MediaDeviceKind, deviceId: string) => {
    await getResultAsync(async () => {
      await switchDevice(kind, deviceId);
    }).match(noop, console.error);
  };
  return { deviceSections, refreshDevices, selectDevice };
};
