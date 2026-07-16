export interface BladeDefinition {
  component: Component;
  icon: string;
  // The route segment for /resources/[id]/[[blade]]; must not collide with the built-in ResourceBladeType slugs
  slug: string;
  title: string;
}
