export interface PortableFormat {
  // File filter for the Import picker (e.g. ".csv,text/csv"); required alongside deserialize
  accept?: string;
  // Import: parse a picked file's text into new resource content
  deserialize?: (content: string) => unknown;
  // Export: self-contained — produces and downloads the artifact, pulling editor/dataset/content as needed
  export?: () => Promise<void>;
  // Menu label, e.g. "CSV", "Personalized HTML"
  label: string;
}
