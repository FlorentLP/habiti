import React, { useState, useContext } from 'react';
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
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useHabits } from '@/context/HabitsContext';

const ProgressScreen = () => {
  const { habitLogs } = useHabits()!;
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
    // Formater la date passée en paramètre au format ISO "YYYY-MM-DD"
    const formattedDate = date.toISOString().split('T')[0]; // "2025-03-15"

    // Filtrer les logs correspondant à la date
    const logsForDate = Object.values(habitLogs).filter(log => {
      // Comparer la date du log (au format "YYYY-MM-DD") avec la date formatée
      const logDate = log.date; // Assurez-vous que log.date est déjà au format ISO
      return logDate === formattedDate;
    });

    // Si aucun log n'est trouvé pour cette date, retourne 0
    if (logsForDate.length === 0) return 0;

    // Compter les habitudes complétées
    const completedCount = logsForDate.filter(log => log.completed).length;

    // Retourner le pourcentage de complétion
    return Math.round((completedCount / logsForDate.length) * 100);
  };


  const getCompletionColor = (completion: number) => {
    const intensity = Math.floor((completion / 100) * 255);
    console.log(completion);
    console.log(intensity);
    return `rgba(108, 99, 255, ${intensity / 255})`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Header title="Statistiques" subtitle="Suivi de vos habitudes" />

        <View style={styles.periodSelector}>
          {periods.map((period) => (
            <Pressable
              key={period.value}
              style={[styles.periodButton, selectedPeriod === period.value && styles.selectedPeriodButton]}
              onPress={() => setSelectedPeriod(period.value)}
            >
              <Text style={[styles.periodButtonText, selectedPeriod === period.value && styles.selectedPeriodButtonText]}>
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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F8FA' },
  container: { flex: 1, padding: 16 },
  periodSelector: { flexDirection: 'row', marginBottom: 16 },
  periodButton: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 8, backgroundColor: '#EFEFEF' },
  selectedPeriodButton: { backgroundColor: '#6C63FF' },
  periodButtonText: { fontSize: 16 },
  selectedPeriodButtonText: { color: '#FFFFFF' },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  calendarTitle: { fontSize: 18, fontWeight: 'bold' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  dayBox: { width: 40, height: 40, borderRadius: 5, justifyContent: 'center', alignItems: 'center', margin: 4 },
  dayText: { color: '#000', fontSize: 14, fontWeight: 'bold' }
});

export default ProgressScreen;