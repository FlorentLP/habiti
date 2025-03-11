import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { db } from '@/config/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, getDocs, doc } from 'firebase/firestore';
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
  getCompletionRate: () => number;
}

const HabitContext = createContext<HabitContextType | null>(null);

export const HabitProvider = ({ children }: { children: React.ReactNode }) => {  const { user } = useAuth();
  const currentUserId = user?.uid;
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitsOfToday, setHabitsOfToday] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<Record<string, HabitLog>>({});

  // Fetch all user habits
  useEffect(() => {
    if (!currentUserId) return;

    const q = query(collection(db, 'habits'), where('userId', '==', currentUserId));
    const unsubscribe = onSnapshot(q, snapshot => {
      setHabits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit)));
    });

    return () => unsubscribe();
  }, [currentUserId]);

  // Fetch today's habits
  const getHabitsForToday = useCallback(async () => {
    if (!currentUserId) return [];
    const todayIndex = (new Date().getDay() + 6) % 7;
    const habitsSnapshot = await getDocs(query(collection(db, 'habits'), where('userId', '==', currentUserId)));
    return habitsSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Habit))
      .filter(habit => habit.selectedDays[todayIndex]);
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;
    const fetchHabits = async () => setHabitsOfToday(await getHabitsForToday());
    fetchHabits();

    const interval = setInterval(() => {
      if (new Date().toISOString().split('T')[0] !== today) fetchHabits();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [currentUserId, getHabitsForToday, today]);

  // Ensure habit logs exist for today
  const ensureHabitLogsExist = useCallback(async (habits: Habit[]) => {
    if (!currentUserId) return;
    const habitLogsRef = collection(db, 'habit_logs');
    const logsSnapshot = await getDocs(query(habitLogsRef, where('date', '==', today), where('userId', '==', currentUserId)));

    const existingLogs: Record<string, HabitLog> = {};
    logsSnapshot.docs.forEach(doc => {
      const data = doc.data() as HabitLog;
      existingLogs[data.habitId] = { id: doc.id, ...data };
    });

    const newLogs = { ...existingLogs };
    for (const habit of habits) {
      if (!existingLogs[habit.id]) {
        const newLog: HabitLog = { habitId: habit.id, date: today, completed: false, userId: currentUserId };
        const docRef = await addDoc(habitLogsRef, newLog);
        newLogs[habit.id] = { ...newLog, id: docRef.id };
      }
    }
    setHabitLogs(newLogs);
  }, [currentUserId, today]);

  useEffect(() => {
    if (habitsOfToday.length > 0) {
      ensureHabitLogsExist(habitsOfToday);
    }
  }, [habitsOfToday, ensureHabitLogsExist]);

  // CRUD functions
  const addHabit = async (habit: Omit<Habit, 'id' | 'userId'>) => {
    if (currentUserId) {
      await addDoc(collection(db, 'habits'), { ...habit, userId: currentUserId });
    }
  };

  const updateHabit = async (id: string, updatedFields: Partial<Habit>) => {
    await updateDoc(doc(db, 'habits', id), updatedFields);
  };

  const deleteHabit = async (id: string) => {
    await deleteDoc(doc(db, 'habits', id));
  };

  const toggleCompletion = async (habitId: string) => {
    const log = habitLogs[habitId];
    if (!log || !log.id) return;
    await updateDoc(doc(db, 'habit_logs', log.id), { completed: !log.completed });
    setHabitLogs(prev => ({ ...prev, [habitId]: { ...log, completed: !log.completed } }));
  };

  const getCompletionRate = () => {
    if (habitsOfToday.length === 0) return 0;
    const completedCount = habitsOfToday.filter(habit => habitLogs[habit.id]?.completed).length;
    return (completedCount / habitsOfToday.length) * 100;
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
