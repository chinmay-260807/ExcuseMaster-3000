
export enum Category {
  SCHOOL = 'School',
  OFFICE = 'Office',
  CODING = 'Coding',
  SOCIAL = 'Social Life'
}

export interface ExcuseResponse {
  text: string;
  emoji: string;
}

export interface HistoryItem extends ExcuseResponse {
  id: string;
  category: Category;
  isDramatic: boolean;
  timestamp: number;
}

export interface AppState {
  currentExcuse: string;
  category: Category;
  isDramatic: boolean;
  isLoading: boolean;
  error: string | null;
  explanation: string | null;
  isExplaining: boolean;
}
