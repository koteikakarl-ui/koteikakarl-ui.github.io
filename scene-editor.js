(() => {
  const localDraft = location.hostname === '127.0.0.1';
  const editing = localDraft && new URLSearchParams(location.search).has('edit-scene');

  const card = document.querySelector('.case--interactive');
  card.classList.add('case--editing-scene');
  const media = card.querySelector('.case__media');
  const scene = card.querySelector('.case__webgl');
  const compact = matchMedia('(max-width:700px)');
  const tablet = matchMedia('(max-width:1100px)');
  const profiles = {
    desktop: { label: 'Горизонтальная', x: -148, y: -95, scale: 1.5, fade: 58 },
    tablet: { label: 'Промежуточная', x: 0, y: -68, scale: 1.58, fade: 68 },
    mobile: { label: 'Вертикальная', x: 42, y: -72, scale: 1.57, fade: 65 },
  };
  const fields = [
    ['x', 'Горизонталь, px', -500, 500, 1],
    ['y', 'Вертикаль, px', -500, 500, 1],
    ['scale', 'Масштаб, ×', 0.25, 4, 0.01],
    ['fade', 'Начало затухания, %', 0, 100, 1],
  ];
  const storageKey = 'portfolio.scene-editor.v1';
  let saved = {};
  if (localDraft) {
    try { saved = JSON.parse(localStorage.getItem(storageKey)) || {}; } catch {}
  }
  const panel = document.createElement('details');
  panel.className = 'scene-editor';
  panel.open = true;
  panel.innerHTML = '<summary>Настройки сцены</summary><div class="scene-editor__controls"><strong></strong><small>Измени ширину окна, чтобы настроить другую раскладку.</small><div class="scene-editor__fields"></div><button type="button">Сбросить эту раскладку</button><small role="status"></small></div>';
  if (editing) document.body.append(panel);
  const title = panel.querySelector('strong');
  const status = panel.querySelector('[role="status"]');
  const inputs = new Map();
  const mode = () => compact.matches ? 'mobile' : tablet.matches ? 'tablet' : 'desktop';
  const defaults = () => profiles[mode()];
  const values = () => ({ ...defaults(), ...saved[mode()] });

  function render(syncInputs = true) {
    const current = values();
    title.textContent = profiles[mode()].label;
    if (syncInputs) {
      for (const [key, input] of inputs) input.value = current[key];
    }
    scene.style.transformOrigin = 'center top';
    scene.style.transform = `translate(${current.x}px, ${current.y}px) scale(${current.scale})`;
    const height = media.getBoundingClientRect().height;
    const top = scene.getBoundingClientRect().top - media.getBoundingClientRect().top;
    const fadeLift = mode() === 'desktop' ? 20 : mode() === 'mobile' ? 36 : 0;
    const fadeEnd = mode() === 'mobile' ? 18 : fadeLift;
    const end = (height - fadeEnd - top) / current.scale;
    const start = Math.min(end, (height * current.fade / 100 - fadeLift - top) / current.scale);
    scene.style.maskImage = `linear-gradient(to bottom, #000 ${start}px, transparent ${end}px)`;
  }
  function persist(syncInputs = true) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(saved));
      status.textContent = 'Сохранено в этом браузере';
    } catch {
      status.textContent = 'Настройки действуют до обновления страницы';
    }
    render(syncInputs);
  }

  for (const [key, name, min, max, step] of fields) {
    const label = document.createElement('label');
    label.textContent = name;
    const input = document.createElement('input');
    Object.assign(input, { type: 'number', min, max, step });
    label.append(input);
    panel.querySelector('.scene-editor__fields').append(label);
    inputs.set(key, input);
    input.addEventListener('input', () => {
      if (!input.value || !input.validity.valid) return;
      saved[mode()] = { ...values(), [key]: input.valueAsNumber };
      persist(false);
    });
    input.addEventListener('change', render);
  }

  panel.querySelector('button').addEventListener('click', () => {
    delete saved[mode()];
    persist();
  });
  for (const size of [compact, tablet]) size.addEventListener('change', () => {
    status.textContent = saved[mode()] ? 'Загружены настройки этой раскладки' : 'Исходные настройки этой раскладки';
    render();
  });
  new ResizeObserver(() => render(false)).observe(media);
  render();
  if (editing) addEventListener('load', () => card.scrollIntoView({ block: 'center' }), { once: true });
})();
