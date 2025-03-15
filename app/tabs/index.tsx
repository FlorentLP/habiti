import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import Header from '../../components/Header';
import HabitItem from '../../components/HabitItem';
import DailyQuote from '../../components/DailyQuote';
import ProgressCircle from '../../components/ProgressCircle';
import { Droplets, Brain, BookOpen, Dumbbell, Briefcase } from 'lucide-react-native';
import { COLORS } from '@/context/constants';
import { useHabits } from '@/context/HabitsContext';

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

export default function HomeScreen() {
  const { habitsOfToday, getCompletionRate, toggleCompletion, habitLogs } = useHabits()!;

  const formattedDate = useMemo(() => new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  }), []);

  const [progress, setProgress] = useState(getCompletionRate());

  useEffect(() => {
    setProgress(getCompletionRate());
  }, [habitLogs, habitsOfToday]);


  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Header title="Today's Habits" subtitle={formattedDate} />
        <View style={styles.progressContainer}>
          <ProgressCircle progress={progress} />
          <Text style={styles.progressText}>Daily Progress</Text>
        </View>
        <DailyQuote />
        <Text style={styles.sectionTitle}>Your Habits</Text>

        {habitsOfToday.length === 0 ? (
          <EmptyState />
        ) : (
          habitsOfToday
            .sort((a, b) => (a.time > b.time ? 1 : -1))
            .map(habit => (
              <HabitItem
                key={habit.id}
                id={habit.id}
                title={`${habit.title} - ${new Date(habit.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
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

const EmptyState = () => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyText}>No habits added yet.</Text>
    <Text style={styles.emptySubtext}>Add your first habit to get started!</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  contentContainer: { padding: 24 },
  progressContainer: { alignItems: 'center', marginBottom: 24 },
  progressText: { fontFamily: 'Poppins-Medium', fontSize: 16, color: COLORS.text, marginTop: 8 },
  sectionTitle: { fontFamily: 'Poppins-SemiBold', fontSize: 20, color: COLORS.text, marginBottom: 16 },
  emptyContainer: {
    alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: '#FFFFFF',
    borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  emptyText: { fontFamily: 'Poppins-Medium', fontSize: 18, color: '#666666', marginBottom: 8 },
  emptySubtext: { fontFamily: 'Poppins-Regular', fontSize: 14, color: '#888888', textAlign: 'center' },
});