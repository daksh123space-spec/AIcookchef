
import React, { useState } from 'react';
import { CourseType, DishSuggestion, Recipe } from './types';
import { getDishSuggestions, getRecipe, generateDishImage } from './services/geminiService';
import IngredientInput from './components/IngredientInput';
import Chatbot from './components/Chatbot';

const App: React.FC = () => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [course, setCourse] = useState<CourseType>(CourseType.MAIN_COURSE);
  const [suggestions, setSuggestions] = useState<DishSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [recipeImage, setRecipeImage] = useState<string | null>(null);
  const [recipeLoading, setRecipeLoading] = useState(false);

  const handleAddIngredient = (ing: string) => {
    if (!ingredients.includes(ing)) {
      setIngredients([...ingredients, ing]);
    }
  };

  const handleRemoveIngredient = (ing: string) => {
    setIngredients(ingredients.filter((i) => i !== ing));
  };

  const handleFindDishes = async () => {
    if (ingredients.length === 0) return;
    setLoading(true);
    setSuggestions([]);
    try {
      const results = await getDishSuggestions(ingredients, course);
      setSuggestions(results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDish = async (dish: DishSuggestion) => {
    setRecipeLoading(true);
    setSelectedRecipe(null);
    setRecipeImage(null);
    try {
      const [recipe, image] = await Promise.all([
        getRecipe(dish.title, ingredients),
        generateDishImage(dish.title)
      ]);
      setSelectedRecipe(recipe);
      setRecipeImage(image);
    } catch (err) {
      console.error(err);
    } finally {
      setRecipeLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-xl italic">
              C
            </div>
            <h1 className="text-xl font-bold tracking-tight text-stone-900 hidden sm:block">ChefGemini</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input */}
        <div className="lg:col-span-5 space-y-8">
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Pantry Inventory
            </h2>
            <p className="text-stone-500 mb-6 text-sm">List the ingredients you currently have. I'll dream up something delicious.</p>
            
            <IngredientInput 
              ingredients={ingredients} 
              onAdd={handleAddIngredient} 
              onRemove={handleRemoveIngredient} 
            />

            <div className="mt-8 space-y-4">
              <label className="block text-sm font-semibold text-stone-700">What are we making?</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(CourseType).map((type) => (
                  <button
                    key={type}
                    onClick={() => setCourse(type)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                      course === type 
                        ? 'bg-orange-600 border-orange-600 text-white shadow-md' 
                        : 'bg-white border-stone-200 text-stone-600 hover:border-orange-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleFindDishes}
              disabled={ingredients.length === 0 || loading}
              className="w-full mt-8 py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 disabled:bg-stone-200 disabled:text-stone-400 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Suggest Dishes
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </>
              )}
            </button>
          </section>
        </div>

        {/* Right Column: Results & Content */}
        <div className="lg:col-span-7 space-y-8">
          {/* Suggestions List */}
          {suggestions.length > 0 && !selectedRecipe && !recipeLoading && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-bold text-stone-900">Recommended for You</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {suggestions.map((dish) => (
                  <button
                    key={dish.id}
                    onClick={() => handleSelectDish(dish)}
                    className="group bg-white p-5 rounded-3xl border border-stone-200 text-left hover:border-orange-500 hover:shadow-xl transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        dish.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : 
                        dish.difficulty === 'Medium' ? 'bg-orange-100 text-orange-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        {dish.difficulty}
                      </span>
                      <span className="text-xs text-stone-400 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {dish.prepTime}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-stone-900 group-hover:text-orange-600 transition-colors">{dish.title}</h3>
                    <p className="text-sm text-stone-500 mt-1 line-clamp-2">{dish.description}</p>
                    <div className="mt-4 w-full h-1 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: `${dish.matchScore}%` }}></div>
                    </div>
                    <div className="mt-1 text-[10px] text-stone-400 font-medium">MATCH SCORE: {dish.matchScore}%</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading Recipe State */}
          {recipeLoading && (
            <div className="bg-white p-12 rounded-3xl border border-stone-200 flex flex-col items-center justify-center space-y-4 animate-pulse">
              <div className="w-16 h-16 border-4 border-orange-100 border-t-orange-600 rounded-full animate-spin"></div>
              <p className="text-stone-500 font-medium">Curating your masterclass recipe...</p>
            </div>
          )}

          {/* Recipe View */}
          {selectedRecipe && !recipeLoading && (
            <div className="bg-white rounded-3xl shadow-lg border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="relative h-64 sm:h-80 bg-stone-100">
                {recipeImage ? (
                  <img src={recipeImage} alt={selectedRecipe.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <button 
                  onClick={() => setSelectedRecipe(null)}
                  className="absolute top-4 left-4 p-2 bg-white/90 backdrop-blur rounded-full shadow-lg hover:bg-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div className="p-8">
                <h2 className="text-3xl font-bold text-stone-900 mb-6">{selectedRecipe.title}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs">1</span>
                        Ingredients
                      </h3>
                      <ul className="space-y-2">
                        {selectedRecipe.ingredients.map((ing, i) => (
                          <li key={i} className="text-stone-600 text-sm flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-stone-300 rounded-full mt-1.5 flex-shrink-0"></span>
                            {ing}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-stone-50 rounded-2xl">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">Nutritional Insight</h3>
                      <p className="text-sm text-stone-600">{selectedRecipe.nutritionalInfo}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs">2</span>
                        Method
                      </h3>
                      <ol className="space-y-4">
                        {selectedRecipe.instructions.map((step, i) => (
                          <li key={i} className="text-stone-600 text-sm">
                            <span className="font-bold text-stone-400 mr-1">{i + 1}.</span> {step}
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs">3</span>
                        Chef's Secrets
                      </h3>
                      <ul className="space-y-2">
                        {selectedRecipe.tips.map((tip, i) => (
                          <li key={i} className="text-stone-600 text-sm italic">
                            &ldquo;{tip}&rdquo;
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-12 flex justify-center">
                   <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-2 text-stone-400 hover:text-stone-900 font-medium transition-colors"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                     </svg>
                     Print Recipe
                   </button>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {suggestions.length === 0 && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white/50 border-2 border-dashed border-stone-200 rounded-3xl">
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-2">Ready to Cook?</h3>
              <p className="text-stone-500 max-w-sm">Enter your ingredients on the left, and I'll show you exactly what you can make right now.</p>
            </div>
          )}
        </div>
      </main>

      <Chatbot />
    </div>
  );
};

export default App;
