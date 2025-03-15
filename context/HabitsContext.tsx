import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { db } from '@/config/firebase';
import {
  collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, getDocs, doc, writeBatch
} from 'firebase/firestore';
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

    const q = query(collection(db, `users/${currentUserId}/habits`));
    const unsubscribe = onSnapshot(q, snapshot => {
      const fetchedHabits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit));
      setHabits(fetchedHabits);
      setHabitsOfToday(fetchedHabits.filter(habit => habit.selectedDays[(new Date().getDay() + 6) % 7]));
    });

    return () => unsubscribe();
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId || habitsOfToday.length === 0) return;

    const habitLogsRef = collection(db, `users/${currentUserId}/habitLogs`);
    const q = query(habitLogsRef, where('date', '==', today));

    const unsubscribe = onSnapshot(q, async snapshot => {
      const existingLogs = snapshot.docs.reduce<Record<string, HabitLog>>((acc, doc) => {
        const data = doc.data() as HabitLog;
        acc[data.habitId] = { id: doc.id, ...data };
        return acc;
      }, {});

      const missingHabits = habitsOfToday.filter(
        habit => !existingLogs[habit.id] && habits.some(h => h.id === habit.id)
      );

      if (missingHabits.length > 0) {
        await addMissingHabitLogs(missingHabits, existingLogs);
      }

      setHabitLogs(existingLogs);
    });

    return () => unsubscribe();
  }, [currentUserId, habitsOfToday, today]);

  async function addMissingHabitLogs(missingHabits: Habit[], existingLogs: Record<string, HabitLog>) {
    if (!currentUserId) return;

    const batch = writeBatch(db);
    missingHabits.forEach(habit => {
      const newLogRef = doc(collection(db, `users/${currentUserId}/habitLogs`));
      const newLog: HabitLog = {
        id: newLogRef.id,
        habitId: habit.id,
        date: today,
        completed: false,
        userId: currentUserId
      };

      batch.set(newLogRef, newLog);
      existingLogs[habit.id] = newLog;
    });

    await batch.commit();
  }

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
      // Supprimer d'abord tous les logs associés à cette habitude
      const habitLogsRef = collection(db, `users/${currentUserId}/habitLogs`);
      const q = query(habitLogsRef, where('habitId', '==', id)); // Rechercher les logs de cette habitude
      await deleteDoc(doc(db, `users/${currentUserId}/habits`, id));

      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);

      querySnapshot.forEach(doc => {
        batch.delete(doc.ref); // Marquer chaque log pour suppression
      });

      // Commiter la suppression des logs
      await batch.commit();

      // Ensuite, supprimer l'habitude elle-même

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
