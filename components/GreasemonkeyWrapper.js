export const createGreasemonkeyEnvironment = (script, metadata) => {
  return `
    (function() {
      // محاكاة وظائف Greasemonkey
      const GM = {
        addStyle: (css) => {
          const style = document.createElement('style');
          style.textContent = css;
          document.head.appendChild(style);
        },
        xmlHttpRequest: (details) => {
          // تنفيذ بسيط لـ GM_xmlhttpRequest
          return fetch(details.url, {
            method: details.method || 'GET',
            headers: details.headers,
            body: details.data
          }).then(response => response.text())
            .then(responseText => {
              if (details.onload) {
                details.onload({ responseText });
              }
            });
        },
        getValue: (key, defaultValue) => {
          // في الواقع، ستحتاج إلى تنفيذ التخزين المحلي هنا
          return defaultValue;
        },
        setValue: (key, value) => {
          // في الواقع، ستحتاج إلى تنفيذ التخزين المحلي هنا
          console.log('setValue called with', key, value);
        },
        // يمكنك إضافة المزيد من وظائف GM حسب الحاجة
      };

      // إضافة متغيرات البيانات الوصفية
      const GM_info = {
        script: ${JSON.stringify(metadata)}
      };

      // تعريف الوظائف العالمية لـ Greasemonkey
      window.GM_addStyle = GM.addStyle;
      window.GM_xmlhttpRequest = GM.xmlHttpRequest;
      window.GM_getValue = GM.getValue;
      window.GM_setValue = GM.setValue;
      window.GM_info = GM_info;

      // تنفيذ السكريبت
      ${script}
    })();
  `;
};

export const parseMetadata = (scriptContent) => {
  const metadataRegex = /\/\/\s*==UserScript==([\s\S]*?)\/\/\s*==\/UserScript==/;
  const match = scriptContent.match(metadataRegex);
  if (!match) return {};

  const metadata = {};
  const lines = match[1].split('\n');
  lines.forEach(line => {
    const [key, value] = line.split(/\s+/).filter(Boolean);
    if (key && value) {
      const cleanKey = key.replace('@', '').trim();
      metadata[cleanKey] = value.trim();
    }
  });

  return metadata;
};