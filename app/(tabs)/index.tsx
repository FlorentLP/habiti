import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import Header from '../../components/Header';
import HabitItem from '../../components/HabitItem';
import DailyQuote from '../../components/DailyQuote';
import ProgressCircle from '../../components/ProgressCircle';
import { Droplets, Brain, BookOpen, Dumbbell, Briefcase } from 'lucide-react-native';
import { useHabits } from '@/context/HabitsContext';
import { db } from '@/app/config/firebase';
import { collection, getDocs, query, where, addDoc, doc, updateDoc } from 'firebase/firestore';
import { Habit, HabitLog, COLORS } from '@/context/constants';

export default function HomeScreen() {
  const { getCompletionRate } = useHabits();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<Record<string, HabitLog>>({});

  useEffect(() => {
    const fetchHabits = async () => {
      const todayHabits = await getHabitsForToday();
      setHabits(todayHabits);
      await ensureHabitLogsExist(todayHabits);
    };
    fetchHabits();
  }, []);

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const getHabitIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'nutrition': return <Droplets size={20} color={COLORS.primary} />;
      case 'mindfulness': return <Brain size={20} color={COLORS.secondary} />;
      case 'learning': return <BookOpen size={20} color="#C5A3FF" />;
      case 'fitness': return <Dumbbell size={20} color="#F8B195" />;
      case 'productivity': return <Briefcase size={20} color={COLORS.accent} />;
      default: return <Droplets size={20} color="#A0A0A0" />;
    }
  };

  const getHabitsForToday = async (): Promise<Habit[]> => {
    const todayDay = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const habitsSnapshot = await getDocs(collection(db, 'habits'));
    const habits: Habit[] = habitsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Habit, 'id'>),
    }));
    return habits.filter(habit => habit.frequency.includes('daily') || habit.frequency.includes(todayDay));
  };

  const ensureHabitLogsExist = async (habits: Habit[]) => {
    const habitLogsRef = collection(db, 'habit_logs');
    const logsQuery = query(habitLogsRef, where('date', '==', today));
    const logsSnapshot = await getDocs(logsQuery);
    const existingLogs: Record<string, HabitLog> = {};

    logsSnapshot.docs.forEach(doc => {
      const data = doc.data() as HabitLog;
      const { id, ...rest } = data; // Extract id separately
      existingLogs[data.habitId] = { id: doc.id, ...rest }; // Avoids duplicate id
    });

    setHabitLogs(existingLogs);

    for (const habit of habits) {
      if (!existingLogs[habit.id]) {
        const newLog: HabitLog = {
          habitId: habit.id,
          date: today,
          completed: false,
        };
        const docRef = await addDoc(habitLogsRef, newLog);

        setHabitLogs(prev => ({
          ...prev,
          [habit.id]: { ...newLog, id: docRef.id }, // Now id is included
        }));
      }
    }
  };

  const toggleCompletion = async (habitId: string) => {
    const log = habitLogs[habitId];

    if (!log || !log.id) return; // Vérifie que log.id existe bien

    await updateDoc(doc(db, 'habit_logs', log.id), {
      completed: !log.completed,
    });

    setHabitLogs(prev => ({
      ...prev,
      [habitId]: { ...log, completed: !log.completed },
    }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Header title="Today's Habits" subtitle={formattedDate} />
        <View style={styles.progressContainer}>
          <ProgressCircle progress={getCompletionRate('day')} />
          <Text style={styles.progressText}>Daily Progress</Text>
        </View>
        <DailyQuote />
        <Text style={styles.sectionTitle}>Your Habits</Text>

        {habits.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No habits added yet.</Text>
            <Text style={styles.emptySubtext}>Add your first habit to get started!</Text>
          </View>
        ) : (
          habits.map(habit => (
            <HabitItem
              key={habit.id}
              id={habit.id}
              title={habit.title}
              category={habit.category}
              icon={getHabitIcon(habit.category)}
              completed={habitLogs[habit.id]?.completed ?? false}
              onToggle={() => toggleCompletion(habit.id)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  progressText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: COLORS.text,
    marginTop: 8,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: COLORS.text,
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    color: '#666666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
  },
});