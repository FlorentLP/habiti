import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  Pressable, 
  Platform,
  TouchableOpacity
} from 'react-native';
import Header from '../../components/Header';
import CategoryBadge from '../../components/CategoryBadge';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

type Period = 'week' | 'month';

export default function ProgressScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  
/*  const categoryData = getHabitsByCategory();
  const categories = Object.keys(categoryData);*/
  
  const periods: { label: string; value: Period }[] = [
    { label: 'Weekly', value: 'week' },
    { label: 'Monthly', value: 'month' },
  ];

  // Generate dates for the current period
  const generateDates = () => {
    const dates = [];
    const startDate = new Date(currentDate);
    
    if (selectedPeriod === 'week') {
      // Set to the beginning of the week (Sunday)
      const day = startDate.getDay();
      startDate.setDate(startDate.getDate() - day);
      
      // Generate 7 days
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        dates.push(date);
      }
    } else {
      // Set to the beginning of the month
      startDate.setDate(1);
      
      // Get the number of days in the month
      const lastDay = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        0
      ).getDate();
      
      // Generate all days in the month
      for (let i = 0; i < lastDay; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        dates.push(date);
      }
    }
    
    return dates;
  };
  
/*  const periodDates = generateDates();
  
  // Format date to YYYY-MM-DD for comparison
  const formatDateForComparison = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  */
/*  // Get completion count for a specific date
  const getCompletionCount = (date: Date) => {
    const dateString = formatDateForComparison(date);
    return completions.filter(completion => completion.date === dateString).length;
  };*/
  
/*  // Get max completion count for the current period
  const getMaxCompletionCount = () => {
    return Math.max(
      ...periodDates.map(date => getCompletionCount(date)),
      1 // Ensure we don't divide by zero
    );
  };
  *//*
  // Calculate the intensity of the color based on completion count
  const getColorIntensity = (count: number) => {
    const maxCount = getMaxCompletionCount();
    const intensity = count / maxCount;
    return Math.max(0.1, intensity); // Ensure at least a light color
  };
  
  // Navigate to previous period
  const goToPreviousPeriod = () => {
    const newDate = new Date(currentDate);
    if (selectedPeriod === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };
  
  // Navigate to next period
  const goToNextPeriod = () => {
    const newDate = new Date(currentDate);
    if (selectedPeriod === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };
  
  // Format period title
  const getPeriodTitle = () => {
    if (selectedPeriod === 'week') {
      const firstDay = periodDates[0];
      const lastDay = periodDates[6];
      return `${firstDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${lastDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };
  
  // Check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };
  
  // Get day name
  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };
*/
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Header title="Your Progress" subtitle="Track your habit consistency" />
        
        <View style={styles.periodSelector}>
          {periods.map((period) => (
            <Pressable
              key={period.value}
              style={[
                styles.periodButton,
                selectedPeriod === period.value && styles.selectedPeriodButton,
              ]}
              onPress={() => setSelectedPeriod(period.value)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period.value && styles.selectedPeriodButtonText,
                ]}
              >
                {period.label}
              </Text>
            </Pressable>
          ))}
        </View>
        
        {/*<View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={goToPreviousPeriod} style={styles.navigationButton}>
              <ChevronLeft size={24} color="#6C63FF" />
            </TouchableOpacity>
            <Text style={styles.calendarTitle}>{getPeriodTitle()}</Text>
            <TouchableOpacity onPress={goToNextPeriod} style={styles.navigationButton}>
              <ChevronRight size={24} color="#6C63FF" />
            </TouchableOpacity>
          </View>
          
          {selectedPeriod === 'week' ? (
            <View style={styles.weekContainer}>
              {periodDates.map((date) => {
                const completionCount = getCompletionCount(date);
                const intensity = getColorIntensity(completionCount);
                
                return (
                  <View key={date.toISOString()} style={styles.dayColumn}>
                    <Text style={styles.dayName}>{getDayName(date)}</Text>
                    <Text style={[styles.dayNumber, isToday(date) && styles.todayText]}>
                      {date.getDate()}
                    </Text>
                    <View 
                      style={[
                        styles.heatmapCell, 
                        { 
                          backgroundColor: `rgba(108, 99, 255, ${intensity})`,
                          borderColor: isToday(date) ? '#6C63FF' : 'transparent',
                        }
                      ]}
                    >
                      {completionCount > 0 && (
                        <Text style={styles.completionCount}>{completionCount}</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.monthContainer}>
               Day headers (Sun-Sat)
              <View style={styles.weekdayHeader}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <Text key={day} style={styles.weekdayText}>{day}</Text>
                ))}
              </View>
              
              <View style={styles.monthGrid}>
                 Add empty cells for days before the 1st of the month
                {Array.from({ length: periodDates[0].getDay() }).map((_, index) => (
                  <View key={`empty-${index}`} style={styles.emptyCell} />
                ))}
                
                 Actual days of the month
                {periodDates.map((date) => {
                  const completionCount = getCompletionCount(date);
                  const intensity = getColorIntensity(completionCount);
                  
                  return (
                    <View key={date.toISOString()} style={styles.dayCell}>
                      <Text style={[styles.monthDayNumber, isToday(date) && styles.todayText]}>
                        {date.getDate()}
                      </Text>
                      <View 
                        style={[
                          styles.monthHeatmapCell, 
                          { 
                            backgroundColor: `rgba(108, 99, 255, ${intensity})`,
                            borderColor: isToday(date) ? '#6C63FF' : 'transparent',
                          }
                        ]}
                      >
                        {completionCount > 0 && (
                          <Text style={styles.monthCompletionCount}>{completionCount}</Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </View>
        
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Habits by Category</Text>
          
          <View style={styles.categoriesContainer}>
            {categories.length > 0 ? (
              categories.map((category) => (
                <View key={category} style={styles.categoryItem}>
                  <CategoryBadge category={category} selected />
                  <Text style={styles.categoryCount}>{categoryData[category]}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No habits added yet</Text>
            )}
          </View>
        </View>*/}
        
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Tips for Success</Text>
          <Text style={styles.tipText}>• Start with small, achievable habits</Text>
          <Text style={styles.tipText}>• Be consistent with your daily routines</Text>
          <Text style={styles.tipText}>• Track your progress to stay motivated</Text>
          <Text style={styles.tipText}>• Celebrate small wins along the way</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8FA',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#EFEFEF',
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  selectedPeriodButton: {
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  periodButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#888888',
  },
  selectedPeriodButtonText: {
    color: '#6C63FF',
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navigationButton: {
    padding: 8,
  },
  calendarTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#333333',
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    alignItems: 'center',
    width: 40,
  },
  dayName: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#888888',
    marginBottom: 4,
  },
  dayNumber: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#333333',
    marginBottom: 8,
  },
  todayText: {
    color: '#6C63FF',
    fontFamily: 'Poppins-SemiBold',
  },
  heatmapCell: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  completionCount: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  monthContainer: {
    width: '100%',
  },
  weekdayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekdayText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#888888',
    width: 40,
    textAlign: 'center',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  emptyCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 2,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 2,
    alignItems: 'center',
  },
  monthDayNumber: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#333333',
  },
  monthHeatmapCell: {
    width: '80%',
    aspectRatio: 1,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  monthCompletionCount: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#333333',
    marginBottom: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 12,
  },
  categoryCount: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#333333',
    marginLeft: 8,
  },
  emptyText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
    padding: 16,
  },
  tipsContainer: {
    backgroundColor: '#F0F0F7',
    borderRadius: 16,
    padding: 20,
  },
  tipsTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#333333',
    marginBottom: 12,
  },
  tipText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#555555',
    marginBottom: 8,
    lineHeight: 22,
  },
});