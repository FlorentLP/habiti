import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import Header from '../../components/Header';
import HabitItem from '../../components/HabitItem';
import DailyQuote from '../../components/DailyQuote';
import ProgressCircle from '../../components/ProgressCircle';
import { Droplets, Brain, BookOpen, Dumbbell, Briefcase } from 'lucide-react-native';
import { db } from '@/config/firebase';
import { collection, getDocs, query, where, addDoc, doc, updateDoc } from 'firebase/firestore';
import { Habit, HabitLog, COLORS } from '@/context/constants';
import { useAuth } from '@/context/authContext';


export default function HomeScreen() {
  const [habitsOfToday, setHabitOfToday] = useState<Habit[]>([]); // etat local habits of today
  const [habitLogs, setHabitLogs] = useState<Record<string, HabitLog>>({}); //etat local de la db logs
  const { user } = useAuth(); // Assure-toi que ton authContext a bien setUser
  const currentUserId = user?.uid; // You can also use context if you store the user in your app state


  //au mount:
  useEffect(() => {
    const fetchHabits = async () => {
      const todayHabits = await getHabitsForToday();
      setHabitOfToday(todayHabits);
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
    if (!currentUserId) return []; // Vérifier que l'utilisateur est bien défini

    const todayDay = new Date().getDay(); // Récupère l'indice du jour (0 = dimanche, 1 = lundi, etc.)
    const adjustedDay = (todayDay === 0) ? 6 : todayDay - 1; // Si c'est dimanche (0), on le convertit en samedi (6), sinon on décrémente de 1

    const habitsSnapshot = await getDocs(
      query(collection(db, 'habits'), where('userId', '==', currentUserId)) // Filtre par userId
    );

    let habits: Habit[] = habitsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Habit, 'id'>),
    }));

    // Filtrer les habitudes selon leur fréquence
    habits = habits.filter(habit => habit.selectedDays[adjustedDay]);


    // Trier les habitudes par heure (time)
    habits.sort((a, b) => (a.time > b.time ? 1 : -1));

    return habits;
  };

  const ensureHabitLogsExist = async (habits: Habit[]) => {
    if (!currentUserId) return;

    const habitLogsRef = collection(db, 'habit_logs');
    const logsSnapshot = await getDocs(
      query(habitLogsRef, where('date', '==', today), where('userId', '==', currentUserId)) // Filtre par userId
    );

    const existingLogs: Record<string, HabitLog> = {};

    logsSnapshot.docs.forEach(doc => {
      const data = doc.data() as HabitLog;
      existingLogs[data.habitId] = { id: doc.id, ...data };
    });

    setHabitLogs(existingLogs);

    for (const habit of habits) {
      if (!existingLogs[habit.id]) {
        const newLog: HabitLog = {
          habitId: habit.id,
          date: today,
          completed: false,
          userId: currentUserId,
        };

        const docRef = await addDoc(habitLogsRef, newLog);

        setHabitLogs(prev => ({
          ...prev,
          [habit.id]: { ...newLog, id: docRef.id },
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

  // progression circle logic
  const getCompletionRate = () => {
    if (habitsOfToday.length === 0) return 0;

    const completedCount = habitsOfToday.filter(habit => habitLogs[habit.id]?.completed).length;
    return (completedCount / habitsOfToday.length) * 100;
  };

  const [progress, setProgress] = React.useState(getCompletionRate());

  useEffect(() => {
    setProgress(getCompletionRate());
  }, [habitLogs, habitsOfToday]); // Met à jour lorsque les logs ou les habitudes du jour changent

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
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No habits added yet.</Text>
            <Text style={styles.emptySubtext}>Add your first habit to get started!</Text>
          </View>
        ) : (
          habitsOfToday
            .sort((a, b) => (a.time > b.time ? 1 : -1)) // Tri côté frontend au cas où
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