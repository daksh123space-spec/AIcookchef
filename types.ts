
export enum CourseType {
  SNACK = 'Snack',
  STARTER = 'Starter',
  MAIN_COURSE = 'Main Course',
  DESSERT = 'Dessert'
}

export interface DishSuggestion {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  prepTime: string;
  matchScore: number; // 1-100, how well it fits ingredients
}

export interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  tips: string[];
  nutritionalInfo: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}
