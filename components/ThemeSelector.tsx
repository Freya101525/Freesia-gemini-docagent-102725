import React from 'react';
import { Theme } from '../types';

interface ThemeSelectorProps {
  themes: Theme[];
  onThemeChange: (theme: Theme) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ themes, onThemeChange }) => {
  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTheme = themes.find(t => t.name === event.target.value);
    if (selectedTheme) {
      onThemeChange(selectedTheme);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="theme-selector" className="text-sm font-medium text-[var(--secondary-text)]">Theme:</label>
      <select
        id="theme-selector"
        onChange={handleSelect}
        className="p-2 border border-[var(--border-color)] rounded-md focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] bg-[var(--primary-bg)] text-[var(--primary-text)] text-sm"
      >
        {themes.map(theme => (
          <option key={theme.name} value={theme.name}>{theme.name}</option>
        ))}
      </select>
    </div>
  );
};

export default ThemeSelector;
