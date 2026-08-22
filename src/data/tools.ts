export type Tool = {
  slug: string;
  title: string;
  description: string;
  href: string;
};

export const TOOLS: Tool[] = [
  {
    slug: 'calculator',
    title: 'Calculator',
    description: 'Mathematical calculator with symbolic input and formula rendering. Type expressions naturally or use the equation editor.',
    href: '/tools/calculator',
  },
  {
    slug: 'palette-picker',
    title: 'Palette Picker',
    description: 'Quick colour picker for teaching materials. Browse the StemVault palette or sample any hex.',
    href: '/tools/palette-picker',
  },
  {
    slug: 'vce-physics-grapher',
    title: 'VCE Physics Grapher',
    description: 'Exam-style kinematics graph builder for VCE Physics. Create x-t, v-t, and a-t graphs with curves, guide lines, and annotations. Export to PNG.',
    href: '/tools/vce-physics-grapher',
  },
];
