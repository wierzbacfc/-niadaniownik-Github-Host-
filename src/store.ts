import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, Recipe } from './types';

interface AppStore extends AppState {
  setAppState: (state: Partial<AppState>) => void;
  updatePantryItem: (item: string, value: boolean) => void;
  deletePantryItem: (item: string) => void;
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (id: string, recipe: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;
  setCalendarDay: (date: string, recipeId: string | null) => void;
  clearPantry: () => void;
  fillPantry: () => void;
}

const initialState: AppState = {
  recipes: [],
  pantry: {},
  calendar: {},
  apiKey: '',
  apiProvider: 'gemini',
  theme: 'dark',
  recipesViewMode: 'grid',
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      ...initialState,
      
      setAppState: (updates) => set((state) => ({ ...state, ...updates })),

      updatePantryItem: (item, value) => 
        set((state) => ({ pantry: { ...state.pantry, [item]: value } })),

      deletePantryItem: (item) =>
        set((state) => {
          const newPantry = { ...state.pantry };
          delete newPantry[item];
          return { pantry: newPantry };
        }),

      addRecipe: (recipe) => 
        set((state) => {
          const newPantry = { ...state.pantry };
          recipe.ingredients.forEach(i => {
            if (!(i in newPantry)) newPantry[i] = false;
          });
          return { recipes: [...state.recipes, recipe], pantry: newPantry };
        }),

      updateRecipe: (id, updates) => 
        set((state) => {
          const newRecipes = state.recipes.map(r => r.id === id ? { ...r, ...updates } : r);
          const newPantry = { ...state.pantry };
          if (updates.ingredients) {
            updates.ingredients.forEach(i => {
              if (!(i in newPantry)) newPantry[i] = false;
            });
          }
          return { recipes: newRecipes, pantry: newPantry };
        }),

      deleteRecipe: (id) => 
        set((state) => {
          const newRecipes = state.recipes.filter(r => r.id !== id);
          const usedIngredients = new Set(newRecipes.flatMap(r => r.ingredients || []));
          const newPantry = { ...state.pantry };
          Object.keys(newPantry).forEach(k => {
            if (!usedIngredients.has(k)) delete newPantry[k];
          });
          return { recipes: newRecipes, pantry: newPantry };
        }),

      setCalendarDay: (date, recipeId) => 
        set((state) => {
          const newCal = { ...state.calendar };
          if (recipeId) newCal[date] = recipeId;
          else delete newCal[date];
          return { calendar: newCal };
        }),

      clearPantry: () => 
        set((state) => {
          const newPantry = { ...state.pantry };
          Object.keys(newPantry).forEach(k => newPantry[k] = false);
          return { pantry: newPantry };
        }),

      fillPantry: () => 
        set((state) => {
          const newPantry = { ...state.pantry };
          Object.keys(newPantry).forEach(k => newPantry[k] = true);
          return { pantry: newPantry };
        }),
    }),
    {
      name: 'sn1', // Persist to local storage under the key 'sn1' just like before
    }
  )
);
