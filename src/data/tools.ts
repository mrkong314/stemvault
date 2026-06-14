export type Tool = {
  slug: string;
  title: string;
  description: string;
  href: string;
};

export const TOOLS: Tool[] = [
  {
    slug: 'palette-picker',
    title: 'Palette Picker',
    description: 'Quick colour picker for teaching materials. Browse the StemVault palette or sample any hex.',
    href: '/tools/palette-picker',
  },
  {
    slug: 'bgsstyle-palette-picker',
    title: 'BGS Style Palette Picker',
    description: 'Interactive colour picker for the Brighton Grammar School brand palette with contrast ratio preview.',
    href: '/tools/bgsstyle-palette-picker',
  },
];
