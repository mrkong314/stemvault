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
    description: 'Countdown to the end of the current period with adjustable bell times, multiple named stopwatches and countdowns, an optional lesson phase timer that logs starter, explicit teaching and independent practice times, and a cold-call name picker with on-device class lists. Installs to a phone home screen.',
    href: '/tools/class-timer',
  },
  {
    slug: 'rep-timer',
    title: 'Rep Timer',
    description: 'One countdown shown as a large percentage with a progress bar, rep counter, quarter beeps, countdown ticks, spoken cues and a big display mode. Installs to a phone home screen.',
    href: '/tools/rep-timer',
  },
  {
    slug: 'random-picker',
    title: 'Random Picker',
    description: 'Spin a wheel of names to pick a student, with winners removed as you go, plus group maker and shuffle modes and saved lists. Installs to a phone home screen.',
    href: '/tools/random-picker',
  },
  {
    slug: 'scratchpad',
    title: 'Scratchpad',
    description: 'Notes filed as tabs and groups, with checkboxes, lists, toggles, tables, inline calculator sections, Markdown shortcuts and pasted images. Saved only in the browser, on the device. Installs to a phone home screen.',
    href: '/tools/scratchpad.html',
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
