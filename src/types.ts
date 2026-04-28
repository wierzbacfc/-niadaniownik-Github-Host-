export interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  tags: string[];
  instructions: string;
}

export interface AppState {
  recipes: Recipe[];
  pantry: Record<string, boolean>;
  calendar: Record<string, string>;
  apiKey: string;
  apiProvider: 'gemini' | 'claude';
  theme: 'dark' | 'light';
  recipesViewMode: 'list' | 'grid';
}
