import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Plus, CreditCard as Edit2, Trash2, X } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';


// Firebase
import { addDoc, collection, deleteDoc, doc, onSnapshot, updateDoc, query, where } from 'firebase/firestore';
import { db } from '@/config/firebase';

// Context & Constants
import { useAuth } from '@/context/authContext';
import { Habit, categories, DAYS, COLORS } from '@/context/constants';

// Components
import Header from '../../components/Header';
import CategoryBadge from '../../components/CategoryBadge';


export default function HabitsScreen() {
  //la liste des habitudes
  const [habits, setHabits] = useState<Habit[]>([]);
  // si le form est visible ou non
  const [modalVisible, setModalVisible] = useState(false);
  //l'habitude que je modifie si j'en modifie une
  const [editingHabit, setEditingHabit] = useState<any>(null);

  //ce sont les champs dynamiques du formulaire 1 state par champ
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDays, setSelectedDays] = useState<boolean[]>([true, true, true, true, true, true, true]);

  const { user } = useAuth(); // Assure-toi que ton authContext a bien setUser
  const currentUserId = user?.uid; // You can also use context if you store the user in your app state

  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const sortedHabits = useMemo(() => {
    return [...habits].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  }, [habits]);

  useEffect(() => { //s'execute au montage
    try {
      if (!currentUserId) return; // Make sure userId is available before fetching
      // lorsque firestore est modifie, il appel la fonction snapshot
      const unsubscribe = onSnapshot(
        query(collection(db, "habits"), where("userId", "==", user.uid)),
        (snapshot) => {
        // recupere chaque document de la table habits
        const newHabits: Habit[] = snapshot.docs.map((doc) => {
          const data = doc.data() as Omit<Habit, "id">; // recupere une habit sans le champ id
          return { id: doc.id, ...data }; // ajoute a l'habit recuperee avec l'id du document
        });
        setHabits(newHabits); // update l'etat locale des habitudes
      });
      return () => unsubscribe(); // arrete l'ecoute en temps reel du firestore si on demounte le composant
    } catch (error) {
      console.error("Firestore error:", error);
    }
  }, [currentUserId]);// Re-run effect if userId changes

  const openAddModal = useCallback(() => {
    setEditingHabit(null);
    setTitle('');
    setSelectedCategory('');
    setSelectedDays([true, true, true, true, true, true, true]);
    setModalVisible(true);
    setTime(new Date());
  }, []);

  const openEditModal = useCallback((habit: Habit) => {
    setEditingHabit(habit);
    setTitle(habit.title);
    setSelectedCategory(habit.category);
    setSelectedDays(habit.selectedDays);
    setModalVisible(true);
    setTime(new Date(habit.time));
  }, []);

  const handleSaveHabit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }
    try {
      if (editingHabit) {
        await updateDoc(doc(db, 'habits', editingHabit.id), {
          title: title.trim(),
          category: selectedCategory || 'Other',
          selectedDays: selectedDays,
          time: time.toISOString(),
        });
      } else {
        await addDoc(collection(db, 'habits'), {
          title: title.trim(),
          category: selectedCategory || 'Other',
          selectedDays: selectedDays,
          userId: currentUserId,
          time: time.toISOString(),
        });
      }
      setModalVisible(false);
    } catch (error) {
      console.error("Firebase Error:", error);
      Alert.alert('Error', 'Failed to save habit. Please try again later.');
    }
  };

  const handleDeleteHabit = async (id :string) => {
    try {
      await deleteDoc(doc(db, 'habits', id));
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete habit');
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const toggleDay = (index: number) => {
    const newSelectedDays = [...selectedDays];
    newSelectedDays[index] = !newSelectedDays[index];
    setSelectedDays(newSelectedDays);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Header title="My Habits" subtitle="Manage your habits" />

        {habits.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No habits added yet</Text>
            <Text style={styles.emptySubtext}>Add your first habit to get started!</Text>
          </View>
        ) : (
          sortedHabits
            .map((habit) => (
            <TouchableOpacity
              key={habit.id}
              style={styles.habitCard}
              onPress={() => openEditModal(habit)}
            >
              <View style={styles.habitHeader}>
                <Text style={styles.habitTitle}>{habit.title}</Text>
                <Edit2 size={18} color={COLORS.primary} />
              </View>

              <View style={styles.habitDetails}>
                <CategoryBadge category={habit.category} selected />
                <View style={styles.selectedDaysBadge}>
                  <Text style={styles.selectedDaysText}>
                    {DAYS.map((day, index) =>
                      habit.selectedDays[index] ? `✅ ${day.substring(0, 2)} ` : `❌ ${day.substring(0, 2)} `
                    ).join(' ')}
                  </Text>
                </View>
                <Text style={styles.habitTime}>
                  {new Date(habit.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingHabit ? 'Edit Habit' : 'Add New Habit'}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <X size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Habit Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Drink water, Meditate, Exercise..."
                  value={title}
                  onChangeText={setTitle}
                  placeholderTextColor="#AAAAAA"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.categoriesContainer}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryButton,
                        selectedCategory === category && styles.selectedCategoryButton,
                      ]}
                      onPress={() => setSelectedCategory(category)}
                    >
                      <Text
                        style={[
                          styles.categoryButtonText,
                          selectedCategory === category && styles.selectedCategoryButtonText,
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Jours de la semaine</Text>
                <View style={styles.daysContainer}>
                  {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dayButton,
                        selectedDays[index] && styles.selectedDayButton
                      ]}
                      onPress={() => toggleDay(index)}
                    >
                      <Text style={[
                        styles.dayButtonText,
                        selectedDays[index] && styles.selectedDayButtonText
                      ]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Heure</Text>
                <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.input}>
                  <Text>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </TouchableOpacity>
                {showTimePicker && (
                  <DateTimePicker
                    value={time}
                    mode="time"
                    is24Hour={true}
                    display="spinner"
                    onChange={handleTimeChange}
                  />
                )}
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, !title.trim() && styles.disabledButton]}
                  onPress={handleSaveHabit}
                  disabled={!title.trim()}
                >
                  <Text style={styles.buttonText}>
                    {editingHabit ? 'Update Habit' : 'Create Habit'}
                  </Text>
                </TouchableOpacity>

                {editingHabit && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteHabit(editingHabit.id)}
                  >
                    <Trash2 size={20} color="#FFFFFF" />
                    <Text style={styles.deleteButtonText}>Delete Habit</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 100, // Extra padding for FAB
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
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
  },
  habitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedDaysBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    padding: 4,
    marginLeft: 8,
  },
  selectedDaysText: {
    color: 'white',
    fontSize: 12,
  },
  habitTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: COLORS.text,
  },
  habitDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: COLORS.text,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: COLORS.text,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryButton: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedCategoryButton: {
    backgroundColor: COLORS.primary,
  },
  categoryButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.text,
  },
  selectedCategoryButtonText: {
    color: '#FFFFFF',
  },
  buttonContainer: {
    marginTop: 8,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  deleteButton: {
    backgroundColor: '#FF9A9A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  habitTime: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.text,
    opacity: 0.8,
    marginLeft: 8,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginHorizontal: 5,
  },
  selectedDayButton: {
    backgroundColor: COLORS.primary,
  },
  dayButtonText: {
    fontSize: 16,
    color: COLORS.primary,
  },
  selectedDayButtonText: {
    color: 'white',
  },

});