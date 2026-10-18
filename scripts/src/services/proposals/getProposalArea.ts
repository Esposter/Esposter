// A change's area is the first segment of its id, which names it `<area>-<slug>`
export const getProposalArea = (id: string): string => {
  const [area = ""] = id.split("-");
  return area;
};
