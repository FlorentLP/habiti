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
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
  removeHabit: (id: string) => void;
  toggleCompletion: (habitId: string, date: string) => void;
  isHabitCompleted: (habitId: string, date: string) => boolean;
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
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from AsyncStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        const habitsData = await AsyncStorage.getItem('habits');
        const completionsData = await AsyncStorage.getItem('completions');
        
        if (habitsData) {
          setHabits(JSON.parse(habitsData));
        } else {
          // Add default habits if none exist
          const defaultHabits = [
            {
              id: '1',
              title: 'Drink 8 glasses of water',
              category: 'Nutrition',
              frequency: 'daily',
              createdAt: new Date().toISOString(),
            },
            {
              id: '2',
              title: 'Meditate for 10 minutes',
              category: 'Mindfulness',
              frequency: 'daily',
              createdAt: new Date().toISOString(),
            },
            {
              id: '3',
              title: 'Read for 30 minutes',
              category: 'Learning',
              frequency: 'daily',
              createdAt: new Date().toISOString(),
            },
          ] as Habit[];
          
          setHabits(defaultHabits);
          await AsyncStorage.setItem('habits', JSON.stringify(defaultHabits));
        }
        
        if (completionsData) {
          setCompletions(JSON.parse(completionsData));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    
    loadData();
  }, []);

  // Save data to AsyncStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem('habits', JSON.stringify(habits));
    }
  }, [habits, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem('completions', JSON.stringify(completions));
    }
  }, [completions, isLoaded]);

  const addHabit = (habit: Omit<Habit, 'id' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...habit,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setHabits((prev) => [...prev, newHabit]);
  };

  const removeHabit = (id: string) => {
    setHabits((prev) => prev.filter((habit) => habit.id !== id));
    setCompletions((prev) => prev.filter((completion) => completion.habitId !== id));
  };

  const toggleCompletion = (habitId: string, date: string) => {
    const isCompleted = isHabitCompleted(habitId, date);
    
    if (isCompleted) {
      // Remove completion
      setCompletions((prev) => 
        prev.filter((completion) => 
          !(completion.habitId === habitId && completion.date === date)
        )
      );
    } else {
      // Add completion
      const newCompletion: HabitCompletion = {
        id: Date.now().toString(),
        habitId,
        date,
      };
      setCompletions((prev) => [...prev, newCompletion]);
    }
  };

  const isHabitCompleted = (habitId: string, date: string) => {
    return completions.some(
      (completion) => completion.habitId === habitId && completion.date === date
    );
  };

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
        addHabit,
        removeHabit,
        toggleCompletion,
        isHabitCompleted,
        getCompletionRate,
        getHabitsByCategory,
      }}
    >
      {children}
    </HabitsContext.Provider>
  );
};