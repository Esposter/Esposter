// The list with a row put in front of the first row that sorts after it, so a list the server pages in order takes the row
// Where that order puts it. A row that sorts after none goes at the end
export const getInsertedItems = <TItem>(
  items: TItem[],
  insertedItem: TItem,
  checkIsAfter: (item: TItem) => boolean,
) => {
  const index = items.findIndex((item) => checkIsAfter(item));
  return items.toSpliced(index === -1 ? items.length : index, 0, insertedItem);
};
