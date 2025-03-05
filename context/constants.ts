// src/constants.ts
export interface Habit {
  id: string;
  title: string;
  category: string;
  frequency: 'daily' | 'weekly';
  userId: string;
  time: string;
}

export interface HabitLog {
  id?: string;
  habitId: string;
  date: string;
  completed: boolean;
  userId: string;
}

export const COLORS = {
  primary: '#A8D5BA', // Pastel green
  secondary: '#B3E0F2', // Soft sky blue
  accent: '#FFDD7F', // Pale yellow
  background: '#F4F4F9', // Off-white
  warm: '#F1E0C6', // Light beige
  text: '#5A5A5A', // Soft dark gray for text
};


export const categories = [
  'Fitness',
  'Mindfulness',
  'Nutrition',
  'Productivity',
  'Learning'
];

export const frequencies = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
];