import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useHabits } from '../../context/HabitsContext';
import Header from '../../components/Header';
import HabitItem from '../../components/HabitItem';
import DailyQuote from '../../components/DailyQuote';
import ProgressCircle from '../../components/ProgressCircle';
import { Droplets, Brain, BookOpen, Dumbbell, Briefcase } from 'lucide-react-native';

// New color palette
const COLORS = {
  primary: '#A8D5BA', // Pastel green
  secondary: '#B3E0F2', // Soft sky blue
  accent: '#FFDD7F', // Pale yellow
  background: '#F4F4F9', // Off-white
  warm: '#F1E0C6', // Light beige
  text: '#5A5A5A', // Soft dark gray for text
};

export default function HomeScreen() {
  const { habits, toggleCompletion, isHabitCompleted, getCompletionRate } = useHabits();
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Format today's date for display
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const getHabitIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'nutrition':
        return <Droplets size={20} color={COLORS.primary} />;
      case 'mindfulness':
        return <Brain size={20} color={COLORS.secondary} />;
      case 'learning':
        return <BookOpen size={20} color="#C5A3FF" />;
      case 'fitness':
        return <Dumbbell size={20} color="#F8B195" />;
      case 'productivity':
        return <Briefcase size={20} color={COLORS.accent} />;
      default:
        return <Droplets size={20} color="#A0A0A0" />;
    }
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
          habits.map((habit) => (
            <HabitItem
              key={habit.id}
              id={habit.id}
              title={habit.title}
              category={habit.category}
              icon={getHabitIcon(habit.category)}
              completed={isHabitCompleted(habit.id, today)}
              onToggle={() => toggleCompletion(habit.id, today)}
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