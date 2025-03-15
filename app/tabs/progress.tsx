import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Pressable,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import Header from '../../components/Header';
import { BookOpen, Brain, Briefcase, ChevronLeft, ChevronRight, Droplets, Dumbbell } from 'lucide-react-native';
import { useHabits } from '@/context/HabitsContext';
import { COLORS, categories } from '@/context/constants';


const ProgressScreen = () => {
  const { habitLogs,habits } = useHabits()!;
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  const periods = [
    { label: 'Semaine', value: 'week' },
    { label: 'Mois', value: 'month' }
  ];

  const generateDates = () => {
    const dates = [];
    const startDate = new Date(currentDate);
    if (selectedPeriod === 'week') {
      startDate.setDate(startDate.getDate() - startDate.getDay());
      for (let i = 0; i < 7; i++) {
        dates.push(new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i));
      }
    } else {
      startDate.setDate(1);
      const lastDay = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
      for (let i = 0; i < lastDay; i++) {
        dates.push(new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i));
      }
    }
    return dates;
  };

  const periodDates = generateDates();

  const goToPreviousPeriod = () => {
    const newDate = new Date(currentDate);
    selectedPeriod === 'week' ? newDate.setDate(newDate.getDate() - 7) : newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const goToNextPeriod = () => {
    const newDate = new Date(currentDate);
    selectedPeriod === 'week' ? newDate.setDate(newDate.getDate() + 7) : newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const getPeriodTitle = () => {
    if (selectedPeriod === 'week') {
      return `${periodDates[0].toLocaleDateString()} - ${periodDates[6].toLocaleDateString()}`;
    } else {
      return currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    }
  };

  const getCompletionPercentage = (date: Date): number => {
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    const logsForDate = Object.values(habitLogs).filter(log => log.date === formattedDate);
    if (logsForDate.length === 0) return 0;
    const completedCount = logsForDate.filter(log => log.completed).length;
    return Math.round((completedCount / logsForDate.length) * 100);
  };

  const getCompletionColor = (completion: number) => {
    const intensity = completion / 100;

    // Définir les couleurs de début (blanc) et de fin (vert flashy healthy)
    const startColor = [255, 255, 255]; // Blanc pour 0%
    const endColor = [102, 204, 102]; // Vert apaisant mais intense pour 100%

    // Interpolation entre les deux couleurs
    const color = startColor.map((start, index) => Math.round(start + (endColor[index] - start) * intensity));

    return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
  };

  const getHabitsCountByCategory = () => {
    const habitCount: { [key: string]: number } = {}; // Déclaration du type explicite pour habitCount
    habits.forEach(habit => {
      const category = habit.category.toLowerCase();
      if (habitCount[category]) {
        habitCount[category]++;
      } else {
        habitCount[category] = 1;
      }
    });

    // Ajout d'un check pour chaque catégorie et mise à 0 si pas d'habitudes
    categories.forEach(category => {
      if (!habitCount[category.toLowerCase()]) {
        habitCount[category.toLowerCase()] = 0;
      }
    });

    return habitCount;
  };


  // Récupération des habitudes par catégorie
  const habitsCountByCategory = getHabitsCountByCategory();

  // Fonction pour obtenir l'icône de la catégorie
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Header title="Statistiques" subtitle="Suivi de vos habitudes" />

        <View style={styles.periodSelector}>
          {periods.map((period) => (
            <Pressable
              key={period.value}
              style={[styles.periodButton, selectedPeriod === period.value ? styles.selectedPeriodButton : styles.deselectedPeriodButton]}
              onPress={() => setSelectedPeriod(period.value)}
            >
              <Text style={[styles.periodButtonText, selectedPeriod === period.value ? styles.selectedPeriodButtonText : styles.deselectedPeriodButtonText]}>
                {period.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={goToPreviousPeriod}>
            <ChevronLeft size={24} color="#6C63FF" />
          </TouchableOpacity>
          <Text style={styles.calendarTitle}>{getPeriodTitle()}</Text>
          <TouchableOpacity onPress={goToNextPeriod}>
            <ChevronRight size={24} color="#6C63FF" />
          </TouchableOpacity>
        </View>

        <View style={styles.calendarGrid}>
          {periodDates.map((date) => {
            const completion = getCompletionPercentage(date);
            return (
              <View
                key={date.toDateString()}
                style={[styles.dayBox, { backgroundColor: getCompletionColor(completion) }]}
              >
                <Text style={styles.dayText}>{date.getDate()}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.categoryContainer}>
          {categories.map(category => (
            <View key={category} style={styles.categoryRow}>
              {getHabitIcon(category)}
              <Text style={styles.categoryText}>
                {category.charAt(0).toUpperCase() + category.slice(1)}: {habitsCountByCategory[category.toLowerCase()]}
              </Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, padding: 16 },
  periodSelector: { flexDirection: 'row', marginBottom: 16 },
  periodButton: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 8 },
  deselectedPeriodButtonText: { color: COLORS.text },
  deselectedPeriodButton: { backgroundColor: 'white' },
  selectedPeriodButton: { backgroundColor: COLORS.primary },
  periodButtonText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
  },
  selectedPeriodButtonText: { color: '#FFFFFF' },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  calendarTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  dayBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 6,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  dayText: { color: '#000', fontSize: 14, fontWeight: 'bold' },
  categoryContainer: { marginTop: 24, padding: 16 },
  categoryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  categoryText: { fontSize: 16, marginLeft: 8, fontWeight: '500' },
});

export default ProgressScreen;
