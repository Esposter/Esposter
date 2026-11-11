// The rows are the root's children named as its first repeated child, so a root that opens with a title element still
// Reads its rows. A root with no repeated child holds one row, its first child
export const getXmlRowElements = (rootElement: Element) => {
  const childElements = Array.from(rootElement.children);
  const rowName = (
    childElements.find(
      (childElement) => childElements.filter(({ tagName }) => tagName === childElement.tagName).length > 1,
    ) ?? childElements.at(0)
  )?.tagName;
  return childElements.filter(({ tagName }) => tagName === rowName);
};
