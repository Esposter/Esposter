export const getDependencyType = (field: string): string => {
  if (field === "devDependencies") return "dev";
  if (field === "optionalDependencies") return "optional";
  if (field === "peerDependencies") return "peer";

  return "";
};
