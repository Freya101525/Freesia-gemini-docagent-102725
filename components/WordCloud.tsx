import React, { useMemo } from 'react';

interface WordCloudProps {
  content: string;
}

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'did', 'do',
  'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have', 'having',
  'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it',
  'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on',
  'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 's', 'same', 'she', 'should',
  'so', 'some', 'such', 't', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there',
  'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were',
  'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'will', 'with', 'you', 'your', 'yours',
  'yourself', 'yourselves', 'document', 'information', 'file', 'report', 'section', 'text', 'page', 'data'
]);

const WordCloud: React.FC<WordCloudProps> = ({ content }) => {
  const words = useMemo(() => {
    if (!content) return [];

    const wordCounts: { [key: string]: number } = {};
    const matches = content.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];

    for (const word of matches) {
      if (!STOP_WORDS.has(word)) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    }

    const sortedWords = Object.entries(wordCounts)
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 50);

    const maxFreq = sortedWords[0]?.value || 1;
    const minFreq = sortedWords[sortedWords.length - 1]?.value || 1;
    
    // Simple shuffle to mix words
    for (let i = sortedWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sortedWords[i], sortedWords[j]] = [sortedWords[j], sortedWords[i]];
    }

    return sortedWords.map(word => {
      // Normalize frequency to a font size range, e.g., 1rem to 3rem
      const size = 1 + (2 * (word.value - minFreq)) / Math.max(1, maxFreq - minFreq);
      return { ...word, size };
    });
  }, [content]);

  if (words.length === 0) {
    return <p className="text-[var(--secondary-text)]">Not enough content to generate a word cloud.</p>;
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 p-4 min-h-[200px] bg-[var(--secondary-bg)] rounded-md">
      {words.map((word) => (
        <span
          key={word.text}
          style={{ fontSize: `${word.size}rem`, lineHeight: '1.2' }}
          className="font-bold text-[var(--accent-color)] opacity-80 hover:opacity-100 transition-opacity"
        >
          {word.text}
        </span>
      ))}
    </div>
  );
};

export default WordCloud;
