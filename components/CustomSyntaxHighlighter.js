// components/CustomSyntaxHighlighter.js
import React, { useEffect, useState } from 'react';
import { Text, ScrollView, StyleSheet } from 'react-native';
import hljs from 'highlight.js/lib/core';
import xml from 'highlight.js/lib/languages/xml';
import javascript from 'highlight.js/lib/languages/javascript';
import css from 'highlight.js/lib/languages/css';

// Register the languages you need
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('css', css);

const CustomSyntaxHighlighter = ({ children, language = 'xml' }) => {
  const [highlighted, setHighlighted] = useState('');

  useEffect(() => {
    const result = hljs.highlight(children, { language });
    setHighlighted(result.value);
  }, [children, language]);

  const renderHighlightedContent = (text) => {
    const lines = text.split('\n');
    return lines.map((line, index) => (
      <Text key={index} style={styles.line}>
        {line}
        {'\n'}
      </Text>
    ));
  };

  return (
    <ScrollView style={styles.container} horizontal>
      <ScrollView nestedScrollEnabled>
        <Text style={styles.codeBlock}>{renderHighlightedContent(highlighted)}</Text>
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#282c34',
    padding: 10,
  },
  codeBlock: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#abb2bf',
  },
  line: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

export default CustomSyntaxHighlighter;