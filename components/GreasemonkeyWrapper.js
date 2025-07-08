export const createGreasemonkeyEnvironment = (script, metadata) => {
  return `
    (function() {
      // Simulate Greasemonkey functions
      const GM = {
        addStyle: (css) => {
          const style = document.createElement('style');
          style.textContent = css;
          document.head.appendChild(style);
        },
        xmlHttpRequest: (details) => {
          // Simple implementation of GM_xmlhttpRequest
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
          // Actually, you will need to implement local storage here
          return defaultValue;
        },
        setValue: (key, value) => {
          // Actually, you will need to implement local storage here
          console.log('setValue called with', key, value);
        },
        // You can add more GM functions as needed
      };

      // Add metadata variables
      const GM_info = {
        script: ${JSON.stringify(metadata)}
      };

      // Define global functions for Greasemonkey
      window.GM_addStyle = GM.addStyle;
      window.GM_xmlhttpRequest = GM.xmlHttpRequest;
      window.GM_getValue = GM.getValue;
      window.GM_setValue = GM.setValue;
      window.GM_info = GM_info;

      // Execute the script
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