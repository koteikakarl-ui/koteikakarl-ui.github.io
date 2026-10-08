// Translate text nodes in place so existing interactions, media and focus survive.
(() => {
  const normalize = value => value.replace(/\s+/gu, ' ').trim();
  const dictionary = new Map(Object.entries(window.portfolioTranslations).map(([ru,en]) => [normalize(ru),en]));
  const reverse = new Map([...dictionary].map(([ru,en]) => [normalize(en),ru]));
  const originals = new WeakMap();
  const attributes = ['aria-label','aria-valuetext','alt','title','data-description','content'];
  const prefixes = [
    ['Текущий раздел: ', 'Current section: '],
    ['Перейти к разделу ', 'Go to section: '],
    ['Инструменты: ', 'Tools: '],
    ['Открыть кейс: ', 'Open case study: '],
    ['Видео кейса ', 'Case study video: '],
    ['Показать отзыв ', 'Show review '],
    ['Страховой мастер-креатив: ', 'Insurance key visual: ']
  ];
  let language = 'ru';
  let initialPass = true;
  function translate(value, target) {
    const key = normalize(value);
    const found = (target === 'en' ? dictionary : reverse).get(key);
    if (found) return value.replace(value.trim(), found);
    for (const [ru,en] of prefixes) {
      const from = target === 'en' ? ru : en;
      if (key.startsWith(from)) return (target === 'en' ? en : ru) + translate(key.slice(from.length),target);
    }
    return value;
  }
  function updateValue(node, key, value, write) {
    let saved = originals.get(node);
    if (!saved) { saved = new Map(); originals.set(node,saved); }
    let entry = saved.get(key);
    // Existing scripts may replace text or attributes after a slide changes.
    if (!entry || value !== entry.last) {
      entry = { ru: initialPass || language === 'ru' || /[а-яё]/iu.test(value) ? value : translate(value,'ru'), last: value };
      saved.set(key,entry);
    }
    const next = language === 'en' ? translate(entry.ru,'en') : entry.ru;
    if (value !== next) write(next);
    entry.last = next;
  }
  function update(root) {
    if (root.nodeType === Node.TEXT_NODE) {
      if (!root.parentElement?.closest('script,style,.language-switch')) updateValue(root,'text',root.nodeValue,next=>root.nodeValue=next);
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE || root.matches('script,style,.language-switch')) return;
    for (const name of attributes) {
      if (root.hasAttribute(name)) updateValue(root,name,root.getAttribute(name),next=>root.setAttribute(name,next));
    }
    for (const child of root.childNodes) update(child);
  }
  const observer = new MutationObserver(records => {
    observer.disconnect();
    for (const record of records) {
      if (record.type === 'childList') record.addedNodes.forEach(update);
      else update(record.target);
    }
    observe();
  });
  function observe() { observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attributes}); }
  function setLanguage(next, save = true) {
    language = next === 'en' ? 'en' : 'ru';
    observer.disconnect();
    document.documentElement.lang = language;
    update(document.documentElement);
    document.querySelectorAll('[data-language]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.language === language)));
    document.querySelector('.language-switch').setAttribute('aria-label',language === 'en' ? 'Language' : 'Язык');
    if (save) {
      try { localStorage.setItem('portfolio-language',language); } catch {}
      const url = new URL(location.href); url.searchParams.set('lang',language);
      history.replaceState(null,'',url);
    }
    observe();
    // Recalculate existing responsive layouts for the translated copy.
    window.dispatchEvent(new Event('resize'));
  }
  document.querySelectorAll('[data-language]').forEach(button=>button.addEventListener('click',()=>setLanguage(button.dataset.language)));
  const requested = new URLSearchParams(location.search).get('lang');
  let stored; try { stored = localStorage.getItem('portfolio-language'); } catch {}
  setLanguage(['ru','en'].includes(requested) ? requested : stored,false);
  initialPass = false;
})();
