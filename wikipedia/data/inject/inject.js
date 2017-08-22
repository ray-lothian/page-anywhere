'use strict';

var current = '';

var prefs = {
  'offset-x': 0,
  'offset-y': 0
};
chrome.storage.local.get(prefs, p => prefs = p);
chrome.storage.onChanged.addListener(ps => {
  Object.keys(ps).forEach(key => {
    if (key in prefs) {
      prefs[key] = ps[key].newValue;
    }
  });
});

var pointer = {
  element: null,
  show: rect => {
    if (!pointer.element) {
      pointer.element = document.createElement('div');
      pointer.element.onmousedown = e => {
        e.stopPropagation();
        const {target, screenX, screenY} = e;
        chrome.runtime.sendMessage({
          method: 'display',
          query: encodeURIComponent(target.dataset.value),
          screenX: screenX,
          screenY: screenY - 35
        });
      };
      document.body.appendChild(pointer.element);
    }
    Object.assign(pointer.element.style, {
      top: (window.scrollY + rect.top - 35 + prefs['offset-y']) + 'px',
      left: (window.scrollX + rect.left + prefs['offset-x']) + 'px',
      display: 'block'
    });
    pointer.element.dataset.value = current;
    pointer.element.classList.add('wikianywhere', 'bounceIn');
  },
  hide: () => {
    if (pointer.element) {
      pointer.element.style.display = 'none';
    }
  }
};

document.addEventListener('selectionchange', () => {
  const selection = window.getSelection().toString();
  if (selection !== current) {
    current = selection.trim();
    if (current && current.length > 2) {
      const range = window.getSelection().getRangeAt(0);
      pointer.show(range.getBoundingClientRect());
    }
    else {
      pointer.hide();
    }
  }
});

document.addEventListener('mousedown', () => window.top.postMessage({
  method: 'close-me'
}, '*'));
