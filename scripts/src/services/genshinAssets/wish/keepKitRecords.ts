// The ids a name joins that have a kit of their own, the playable record its kit names. A name no kit reaches keeps
// Every id it joins, since nothing else tells its records apart
export const keepKitRecords = (ids: readonly number[], hasKit: (id: number) => boolean): number[] => {
  const kitIds = ids.filter((id) => hasKit(id));
  return kitIds.length > 0 ? kitIds : [...ids];
};
