import React, { useState } from 'react';
import { Tag } from 'lucide-react';

const predefinedTags = [
  'Importante',
  'Personale',
  'Lavoro',
  'Urgente',
  'Debug',
  'Temp',
  'Config',
];

interface TagInputProps {
  onAdd: (tag: string) => void;
  existingTags?: string[];
}

export const TagInput: React.FC<TagInputProps> = ({
  onAdd,
  existingTags = [],
}) => {
  const [tag, setTag] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = tag.trim();
      if (trimmed && !existingTags.includes(trimmed)) {
        onAdd(trimmed);
        setTag('');
        setShowSuggestions(false);
      }
    }
  };

  const filteredSuggestions = predefinedTags.filter(
    (t) =>
      t.toLowerCase().includes(tag.toLowerCase()) &&
      !existingTags.includes(t) &&
      tag.trim() !== ''
  );

  const handleSelectSuggestion = (suggestedTag: string) => {
    onAdd(suggestedTag);
    setTag('');
    setShowSuggestions(false);
  };

  return (
    <div className='relative w-full max-w-xs'>
      <div className='flex items-center gap-1'>
        <Tag className='h-4 w-4 text-gray-400' />
        <input
          className='text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring w-full'
          placeholder='Aggiungi tag'
          value={tag}
          onChange={(e) => {
            setTag(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
        />
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul className='absolute z-10 bg-white border border-gray-200 mt-1 rounded shadow w-full text-xs'>
          {filteredSuggestions.map((suggestion) => (
            <li
              key={suggestion}
              className='px-3 py-1 hover:bg-gray-100 cursor-pointer'
              onClick={() => handleSelectSuggestion(suggestion)}>
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
