import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  Platform,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { useHabits } from '../../context/HabitsContext';
import Header from '../../components/Header';
import { Plus, CreditCard as Edit2, Trash2, X } from 'lucide-react-native';
import CategoryBadge from '../../components/CategoryBadge';

// New color palette
const COLORS = {
  primary: '#A8D5BA', // Pastel green
  secondary: '#B3E0F2', // Soft sky blue
  accent: '#FFDD7F', // Pale yellow
  background: '#F4F4F9', // Off-white
  warm: '#F1E0C6', // Light beige
  text: '#5A5A5A', // Soft dark gray for text
};

const categories = ['Fitness', 'Mindfulness', 'Nutrition', 'Productivity', 'Learning'];
const frequencies = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
];

export default function HabitsScreen() {
  const { habits, addHabit, removeHabit } = useHabits();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingHabit, setEditingHabit] = useState<any>(null);
  
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  
  const openAddModal = () => {
    setEditingHabit(null);
    setTitle('');
    setSelectedCategory('');
    setFrequency('daily');
    setModalVisible(true);
  };
  
  const openEditModal = (habit: any) => {
    setEditingHabit(habit);
    setTitle(habit.title);
    setSelectedCategory(habit.category);
    setFrequency(habit.frequency);
    setModalVisible(true);
  };
  
  const handleSaveHabit = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }
    
    if (editingHabit) {
      // Update existing habit logic would go here
      // For now, we'll just remove the old one and add a new one
      removeHabit(editingHabit.id);
    }
    
    addHabit({
      title: title.trim(),
      category: selectedCategory || 'Other',
      frequency,
    });
    
    setModalVisible(false);
  };
  
  const handleDeleteHabit = () => {
    if (editingHabit) {
      Alert.alert(
        'Delete Habit',
        'Are you sure you want to delete this habit?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              removeHabit(editingHabit.id);
              setModalVisible(false);
            },
          },
        ]
      );
    }
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
          habits.map((habit) => (
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
                <View style={styles.frequencyBadge}>
                  <Text style={styles.frequencyText}>
                    {habit.frequency === 'daily' ? 'Daily' : 'Weekly'}
                  </Text>
                </View>
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
                <Text style={styles.label}>Frequency</Text>
                <View style={styles.frequencyContainer}>
                  {frequencies.map((item) => (
                    <TouchableOpacity
                      key={item.value}
                      style={[
                        styles.frequencyButton,
                        frequency === item.value && styles.selectedFrequencyButton,
                      ]}
                      onPress={() => setFrequency(item.value as 'daily' | 'weekly')}
                    >
                      <Text
                        style={[
                          styles.frequencyButtonText,
                          frequency === item.value && styles.selectedFrequencyButtonText,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
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
                    onPress={handleDeleteHabit}
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
  habitTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: COLORS.text,
  },
  habitDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  frequencyBadge: {
    backgroundColor: COLORS.secondary + '30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 8,
  },
  frequencyText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: COLORS.text,
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
  frequencyContainer: {
    flexDirection: 'row',
  },
  frequencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 12,
  },
  selectedFrequencyButton: {
    backgroundColor: COLORS.primary + '20',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  frequencyButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.text,
  },
  selectedFrequencyButtonText: {
    color: COLORS.primary,
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
});