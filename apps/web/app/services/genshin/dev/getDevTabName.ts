// The panel's tab a variable's group is listed under: its first name, so `Look/Sky` is listed under the Look tab
export const getDevTabName = (group: string): string => {
  const [tabName = ""] = group.split("/");
  return tabName;
};
