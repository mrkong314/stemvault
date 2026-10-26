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
    slug: 'class-timer',
    title: 'Class Timer',
    description: 'Countdown to the end of the current period with adjustable bell times, plus multiple named stopwatches and countdowns and a cold-call name picker with on-device class lists. Installs to a phone home screen.',
    href: '/tools/class-timer',
  },
  {
    slug: 'pace-calculator',
    title: 'Pace Calculator',
    description: 'Running pace, time and distance solver with km-by-km or mile splits for even and negative-split plans, plus Riegel race predictions. Installs to a phone home screen.',
    href: '/tools/pace-calculator',
  },
  {
    slug: 'random-picker',
    title: 'Random Picker',
    description: 'Pick one name, several, or make groups from any pasted list, with no-repeat pools, saved lists and a shuffle mode. Installs to a phone home screen.',
    href: '/tools/random-picker',
  },
  {
    slug: 'palette-picker',
    title: 'Palette Picker',
    description: 'Quick colour picker for teaching materials. Browse the StemVault palette or sample any hex.',
    href: '/tools/palette-picker',
  },
  {
    slug: 'vce-electrical-circuit-maker',
    title: 'VCE Electrical Circuit Maker',
    description: 'Exam-style circuit diagram builder for VCE Physics. Drag in cells, resistors, lamps, switches, meters and semiconductors, wire them up, and read off the circuit analysis. Export to PNG or SVG.',
    href: '/tools/vce-electrical-circuit-maker',
  },
  {
    slug: 'vce-maths-grapher',
    title: 'VCE Maths Grapher',
    description: 'Exam-style function graph builder for VCE Maths. Plot curves with intercepts, intersections, asymptotes, tangents, and shaded areas. Export to PNG.',
    href: '/tools/vce-maths-grapher',
  },
  {
    slug: 'vce-physics-grapher',
    title: 'VCE Physics Grapher',
    description: 'Exam-style kinematics graph builder for VCE Physics. Create x-t, v-t, and a-t graphs with curves, guide lines, and annotations. Export to PNG.',
    href: '/tools/vce-physics-grapher',
  },
];
