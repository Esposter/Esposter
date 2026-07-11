// Shape of queryCollectionSearchSections results, doubling as the MiniSearch document type
export interface DocsSearchSection {
  content: string;
  id: string;
  level: number;
  title: string;
  titles: string[];
}
