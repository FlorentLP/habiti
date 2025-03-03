import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Habit {
  id: string;
  title: string;
  category: string;
  frequency: 'daily' | 'weekly';
  createdAt: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string;
}

interface HabitsContextType {
  habits: Habit[];
  completions: HabitCompletion[];
  getCompletionRate: (period?: 'day' | 'week' | 'month') => number;
  getHabitsByCategory: () => Record<string, number>;
}

const HabitsContext = createContext<HabitsContextType | undefined>(undefined);

export const useHabits = () => {
  const context = useContext(HabitsContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitsProvider');
  }
  return context;
};

export const HabitsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);


  const getCompletionRate = (period: 'day' | 'week' | 'month' = 'day') => {
    if (habits.length === 0) return 0;
    
    const today = new Date();
    let startDate = new Date(today);
    
    switch (period) {
      case 'week':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(today.getMonth() - 1);
        break;
      default:
        // Just today
        break;
    }
    
    const relevantCompletions = completions.filter((completion) => {
      const completionDate = new Date(completion.date);
      return completionDate >= startDate && completionDate <= today;
    });
    
    const dailyHabits = habits.filter((habit) => habit.frequency === 'daily');
    
    if (dailyHabits.length === 0) return 0;
    
    const daysDiff = Math.max(1, Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const totalPossibleCompletions = dailyHabits.length * daysDiff;
    
    return (relevantCompletions.length / totalPossibleCompletions) * 100;
  };

  const getHabitsByCategory = () => {
    return habits.reduce((acc, habit) => {
      const category = habit.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category]++;
      return acc;
    }, {} as Record<string, number>);
  };

  return (
    <HabitsContext.Provider
      value={{
        habits,
        completions,
        getCompletionRate,
        getHabitsByCategory,
      }}
    >
      {children}
    </HabitsContext.Provider>
  );
};