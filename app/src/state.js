// Layouts, colour grades, export sizes and the default poster state for Cover Pop.
// Layouts name their panels in reading order; rects are [x, y, w, h] fractions of the canvas.
export const LAYOUTS = {
  hero2: {
    label: 'Hero + two',
    count: 3,
    rects(w, h, g) {
      return [
        [0, 0, w, h * 0.6],
        [0, h * 0.6 + g, w / 2 - g / 2, h * 0.4 - g],
        [w / 2 + g / 2, h * 0.6 + g, w / 2 - g / 2, h * 0.4 - g],
      ];
    },
  },
  hero3: {
    label: 'Hero + three',
    count: 4,
    rects(w, h, g) {
      const x = w * 0.62;
      return [
        [0, 0, x - g / 2, h],
        [x + g / 2, 0, w - x - g / 2, h / 3 - g / 2],
        [x + g / 2, h / 3 + g / 2, w - x - g / 2, h / 3 - g],
        [x + g / 2, (2 * h) / 3 + g / 2, w - x - g / 2, h / 3 - g / 2],
      ];
    },
  },
  grid4: {
    label: 'Four squares',
    count: 4,
    rects(w, h, g) {
      return [
        [0, 0, w / 2 - g / 2, h / 2 - g / 2],
        [w / 2 + g / 2, 0, w / 2 - g / 2, h / 2 - g / 2],
        [0, h / 2 + g / 2, w / 2 - g / 2, h / 2 - g / 2],
        [w / 2 + g / 2, h / 2 + g / 2, w / 2 - g / 2, h / 2 - g / 2],
      ];
    },
  },
};

// Grades: a canvas filter for the photos plus the tint drawn over each panel.
export const GRADES = {
  sunset: {
    label: 'Sunset',
    filter: 'saturate(1.35) contrast(1.08)',
    tint: ['rgba(255, 122, 60, 0)', 'rgba(255, 122, 60, 0.22)', 'rgba(190, 30, 110, 0.5)'],
    dot: 'rgba(255, 255, 255, 0.22)',
  },
  neon: {
    label: 'Neon',
    filter: 'saturate(1.7) contrast(1.12) hue-rotate(-6deg)',
    tint: ['rgba(34, 211, 238, 0)', 'rgba(34, 211, 238, 0.18)', 'rgba(255, 47, 179, 0.42)'],
    dot: 'rgba(34, 211, 238, 0.3)',
  },
  noir: {
    label: 'Noir',
    filter: 'grayscale(0.92) contrast(1.22) brightness(0.96)',
    tint: ['rgba(8, 8, 14, 0)', 'rgba(8, 8, 14, 0.2)', 'rgba(8, 8, 14, 0.55)'],
    dot: 'rgba(255, 255, 255, 0.22)',
  },
};

export const SIZES = {
  '1080x1080': [1080, 1080],
  '1080x1350': [1080, 1350],
  '1920x1080': [1920, 1080],
};

export const SAMPLES = ['pier', 'boulevard'];

/** The poster's starting state: every panel already holds a bundled sample photo. */
export function defaultState() {
  return {
    layout: 'hero2',
    grade: 'sunset',
    caption: 'Sunset Heist',
    subcaption: 'A summer of trouble',
    size: '1080x1080',
    panels: [
      { sample: 'pier', img: null, ox: 0, oy: 0, zoom: 1 },
      { sample: 'boulevard', img: null, ox: 0, oy: 0, zoom: 1 },
      { sample: 'pier', img: null, ox: 0, oy: -0.06, zoom: 1.15 },
      { sample: 'boulevard', img: null, ox: 0, oy: 0, zoom: 1 },
    ],
  };
}
