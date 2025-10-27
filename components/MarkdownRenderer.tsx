
import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const renderContent = () => {
    let html = content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Highlights ==text==
    html = html.replace(/==(.*?)==/g, '<span class="bg-coral-200 text-coral-800 font-semibold px-1 rounded-sm">$1</span>');

    // Bold **text** or __text__
    html = html.replace(/\*\*(.*?)\*\*|__(.*?)__/g, '<strong>$1$2</strong>');

    // Italic *text* or _text_
    html = html.replace(/\*(.*?)\*|_(.*?)_/g, '<em>$1$2</em>');

    // Strikethrough ~~text~~
    html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');

    // Inline code `code`
    html = html.replace(/`(.*?)`/g, '<code class="bg-slate-200 text-slate-800 px-1 rounded-sm font-mono text-sm">$1</code>');

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Unordered lists
    html = html.replace(/^\s*[-*] (.*)/gim, '<li>$1</li>');
    html = html.replace(/<\/li>\n<li>/g, '</li><li>'); // Join adjacent list items
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    
    // Ordered lists
    html = html.replace(/^\s*\d+\. (.*)/gim, '<oli>$1</oli>'); // Use temporary tag
    html = html.replace(/<\/oli>\n<oli>/g, '</oli><oli>');
    html = html.replace(/(<oli>.*<\/oli>)/gs, '<ol>$1</ol>');
    html = html.replace(/<oli>/g, '<li>').replace(/<\/oli>/g, '</li>');

    // Tables
    html = html.replace(/^\|(.+)\|$/gm, (match, row) => {
        const cells = row.split('|').slice(1, -1);
        return `<tr>${cells.map(cell => `<td>${cell.trim()}</td>`).join('')}</tr>`;
    });
    html = html.replace(/<tr><td>---*<\/td>.*<\/tr>/g, (match) => {
        return match.includes('---') ? '' : match;
    });
    html = html.replace(/(<tr>.*<\/tr>)/gs, '<table>$1</table>');
    html = html.replace(/<\/table>\s*<table>/g, '');


    // Paragraphs
    html = html.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('');
    // Remove empty paragraphs and clean up list wrappers
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<ul>|<table>|<ol>)/g, '$1');
    html = html.replace(/(<\/ul>|<\/table>|<\/ol>)<\/p>/g, '$1');

    return { __html: html };
  };

  return (
    <div
      className="prose prose-slate max-w-none prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-strong:font-semibold prose-em:italic"
      dangerouslySetInnerHTML={renderContent()}
    />
  );
};

export default MarkdownRenderer;
