import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { db } from '@/config/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, getDocs, doc, writeBatch } from 'firebase/firestore';
import { useAuth } from '@/context/authContext';
import { Habit, HabitLog } from '@/context/constants';

interface HabitContextType {
  habits: Habit[];
  today: string;
  habitsOfToday: Habit[];
  habitLogs: Record<string, HabitLog>;
  addHabit: (habit: Omit<Habit, 'id' | 'userId'>) => Promise<void>;
  updateHabit: (id: string, updatedFields: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleCompletion: (habitId: string) => Promise<void>;
  getCompletionRate: () => Promise<number>;
}

const HabitContext = createContext<HabitContextType | null>(null);

export const HabitProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const currentUserId = user?.uid;
  const today = new Date().toISOString().split('T')[0];

  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitsOfToday, setHabitsOfToday] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<Record<string, HabitLog>>({});

  useEffect(() => {
    if (!currentUserId) return;

    const q = query(collection(db, 'habits'), where('userId', '==', currentUserId));
    const unsubscribe = onSnapshot(q, snapshot => {
      const fetchedHabits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit));
      setHabits(fetchedHabits);
      setHabitsOfToday(fetchedHabits.filter(habit => habit.selectedDays[(new Date().getDay() + 6) % 7]));
    });

    return () => unsubscribe();
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId || habitsOfToday.length === 0) return;
    const habitLogsRef = collection(db, 'habit_logs');
    const q = query(habitLogsRef, where('date', '==', today), where('userId', '==', currentUserId));

    const unsubscribe = onSnapshot(q, async snapshot => {
      const existingLogs: Record<string, HabitLog> = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data() as HabitLog;
        existingLogs[data.habitId] = { id: doc.id, ...data };
      });

      const missingHabits = habitsOfToday.filter(habit => !existingLogs[habit.id]);
      if (missingHabits.length > 0) {
        const batch = writeBatch(db);
        missingHabits.forEach(habit => {
          const newLogRef = doc(collection(db, 'habit_logs'));
          batch.set(newLogRef, { habitId: habit.id, date: today, completed: false, userId: currentUserId });
          existingLogs[habit.id] = { id: newLogRef.id, habitId: habit.id, date: today, completed: false, userId: currentUserId };
        });
        await batch.commit();
      }
      setHabitLogs(existingLogs);
    });

    return () => unsubscribe();
  }, [currentUserId, habitsOfToday, today]);

  useEffect(() => {
    if (!habits.length) return;

    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    const timeToMidnight = midnight.getTime() - now.getTime();

    const timeout = setTimeout(() => {
      setHabitsOfToday(habits.filter(habit => habit.selectedDays[(new Date().getDay() + 6) % 7]));
    }, timeToMidnight);

    return () => clearTimeout(timeout);
  }, [habits]);

  const addHabit = async (habit: Omit<Habit, 'id' | 'userId'>) => {
    if (currentUserId) {
      await addDoc(collection(db, `users/${currentUserId}/habits`), { ...habit, userId: currentUserId });
    }
  };

  const updateHabit = async (id: string, updatedFields: Partial<Habit>) => {
    if (currentUserId) {
      await updateDoc(doc(db, `users/${currentUserId}/habits`, id), updatedFields);
    }
  };

  const deleteHabit = async (id: string) => {
    if (currentUserId) {
      await deleteDoc(doc(db, `users/${currentUserId}/habits`, id));
    }
  };

  const toggleCompletion = async (habitId: string) => {
    if (!currentUserId) return;

    const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
    const logsRef = collection(db, `users/${currentUserId}/habitLogs`);
    const q = query(logsRef, where("habitId", "==", habitId), where("date", "==", today));

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      // Log existant -> update
      const log = querySnapshot.docs[0];
      await updateDoc(log.ref, { completed: !log.data().completed });
    } else {
      // Pas encore de log -> créer un nouveau
      await addDoc(logsRef, { habitId, date: today, completed: true, userId: currentUserId });
    }
  };

  const getCompletionRate = async () => {
    if (!currentUserId) return 0;

    const today = new Date().toISOString().split('T')[0];
    const logsRef = collection(db, `users/${currentUserId}/habitLogs`);
    const q = query(logsRef, where("date", "==", today));

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return 0;

    const logs = querySnapshot.docs.map(doc => doc.data());
    const completedCount = logs.filter(log => log.completed).length;

    return (completedCount / logs.length) * 100;
  };

  return (
    <HabitContext.Provider value={{ habits, today, habitsOfToday, habitLogs, addHabit, updateHabit, deleteHabit, toggleCompletion, getCompletionRate }}>
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => {
  return useContext(HabitContext);
};
