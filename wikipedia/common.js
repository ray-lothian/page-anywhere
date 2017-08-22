'use strict';

chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.method === 'display') {
    chrome.storage.local.get({
      width: 400,
      height: 500,
      locale: 'en'
    }, prefs => {
      chrome.tabs.executeScript(sender.tab.id, {
        code: `
          {
            const iframe = document.createElement('iframe');
            iframe.src = 'https://${prefs.locale}.m.wikipedia.org/w/index.php?search=${request.query}';
            Object.assign(iframe.style, {
              left: (${request.screenX} - window.screenLeft + window.scrollX) + 'px',
              top: (${request.screenY} - window.screenTop + window.scrollY) + 'px',
              width: '${prefs.width}px',
              height: '${prefs.height}px'
            });
            iframe.classList.add('wikiframeme');
            iframe.onload = () => {
              iframe.dataset.loaded = true;
            };
            document.body.appendChild(iframe);
            const callback = (e) => {
              if (e.data && e.data.method === 'close-me') {
                document.body.removeChild(iframe);
                window.removeEventListener('message', callback);
                e.preventDefault();
              }
            }
            window.addEventListener('message', callback);
          }
        `
      });
    });
  }
});
