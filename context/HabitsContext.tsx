import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '@/config/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, getDocs, doc } from 'firebase/firestore';
import { useAuth } from '@/context/authContext';
import { Habit } from '@/context/constants';

interface HabitContextType {
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'userId'>) => Promise<void>;
  updateHabit: (id: string, updatedFields: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  getHabitsForToday: () => Promise<Habit[]>;
}

const HabitContext = createContext<HabitContextType | null>(null);

export const HabitProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const currentUserId = user?.uid;
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    try {
      if (!currentUserId) return;

      const q = query(collection(db, 'habits'), where('userId', '==', currentUserId));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newHabits: Habit[] = snapshot.docs.map(doc => {
          const data = doc.data() as Omit<Habit, "id">;
          return { id: doc.id, ...data };
        });
        setHabits(newHabits);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Firestore error:", error);
    }
  }, [currentUserId]);

  const addHabit = async (habit: Omit<Habit, 'id' | 'userId'>
  ) => {
    if (!currentUserId) return;
    await addDoc(collection(db, 'habits'), { ...habit, userId: currentUserId });
  };

  const updateHabit = async (id: string, updatedFields: Partial<Habit>) => {
    await updateDoc(doc(db, 'habits', id), updatedFields);
  };

  const deleteHabit = async (id: string) => {
    await deleteDoc(doc(db, 'habits', id));
  };

  const getHabitsForToday = async (): Promise<Habit[]> => {
    if (!currentUserId) return [];
    const todayIndex = (new Date().getDay() + 6) % 7;
    const habitsSnapshot = await getDocs(query(collection(db, 'habits'), where('userId', '==', currentUserId)));
    return habitsSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Habit))
      .filter(habit => habit.selectedDays[todayIndex]);
  };

  return (
    <HabitContext.Provider value={{ habits, addHabit, updateHabit, deleteHabit, getHabitsForToday }}>
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => {
  return useContext(HabitContext);
};
