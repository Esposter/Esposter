const DEVICE_UTILIZATION_REGEX = /"Device Utilization %"=(?<utilization>\d+(?:\.\d+)?)/u;

// The first accelerator's device utilisation from `ioreg`, or none when the accelerator reports no such figure
export const parseIoregDeviceUtilization = (output: string): number | undefined => {
  const match = DEVICE_UTILIZATION_REGEX.exec(output);
  return match ? Number(match[1]) : undefined;
};
