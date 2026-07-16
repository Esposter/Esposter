export interface PortableFormat {
  // Export: self-contained -- produces and downloads the artifact, pulling editor/dataset/content as needed
  export?: () => Promise<void>;
  // Import: self-contained -- picks a file, parses it, and writes the new resource content
  import?: () => Promise<void>;
  // Menu label, e.g. "Csv", "Personalized HTML"
  label: string;
}
