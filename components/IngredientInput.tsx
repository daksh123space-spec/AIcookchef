
import React, { useState } from 'react';

interface Props {
  ingredients: string[];
  onAdd: (ingredient: string) => void;
  onRemove: (ingredient: string) => void;
}

const IngredientInput: React.FC<Props> = ({ ingredients, onAdd, onRemove }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onAdd(input.trim());
      setInput('');
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. Eggs, Flour, Spinach..."
          className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
        />
        <button
          type="submit"
          className="absolute right-2 top-2 bottom-2 px-4 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors"
        >
          Add
        </button>
      </form>

      <div className="flex flex-wrap gap-2 mt-4">
        {ingredients.map((ing) => (
          <span
            key={ing}
            className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium animate-in fade-in slide-in-from-left-2"
          >
            {ing}
            <button
              onClick={() => onRemove(ing)}
              className="ml-2 text-orange-600 hover:text-orange-900 focus:outline-none"
            >
              &times;
            </button>
          </span>
        ))}
        {ingredients.length === 0 && (
          <p className="text-stone-400 text-sm italic">No ingredients added yet...</p>
        )}
      </div>
    </div>
  );
};

export default IngredientInput;
