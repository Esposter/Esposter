export interface PortableFormat {
  // Export: self-contained -- produces and downloads the artifact, pulling editor/dataset/content as needed
  export?: () => Promise<void>;
  // The format's own icon, shown against it in the import/export submenus — the verb's arrow belongs to the
  // Command that opens them, and repeating it down the list says nothing about which entry is which
  icon: string;
  // Import: self-contained -- picks a file, parses it, and writes the new resource content
  import?: () => Promise<void>;
  // Menu label, e.g. "Csv", "Personalized HTML"
  label: string;
}
