// Fixed scenes for screenshots: ?shot=editor shows the page with sample photos;
// ?shot=cover shows the cover alone at its export size. `photo` picks the hero
// sample, `photos` a comma list for every panel, `layout`, `grade`, `size`,
// `caption` and `sub` the rest. window.__shotReady is set once painted.
export async function runShot(query, applyScene) {
  const scene = {
    layout: query.get('layout') ?? undefined,
    grade: query.get('grade') ?? undefined,
    size: query.get('size') ?? undefined,
    caption: query.get('caption') ?? undefined,
    sub: query.get('sub') ?? undefined,
    photos: query.get('photos') ? query.get('photos').split(',') : undefined,
    heroZoom: query.get('heroZoom') ? Number(query.get('heroZoom')) : undefined,
  };
  if (!scene.photos && query.get('photo')) scene.photos = [query.get('photo')];
  await applyScene(scene);
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}
