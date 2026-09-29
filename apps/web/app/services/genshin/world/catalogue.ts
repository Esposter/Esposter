import catalogueJson from "@/assets/genshin/catalogue.json";
import { catalogueSchema } from "@/models/genshin/world/Catalogue";

// The catalogue every view reads, imported with the world's code and checked against its schema as it loads
export const catalogue = catalogueSchema.parse(catalogueJson);
