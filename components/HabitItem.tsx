import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Check } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, Easing } from 'react-native-reanimated';

// New color palette
const COLORS = {
  primary: '#A8D5BA', // Pastel green
  secondary: '#B3E0F2', // Soft sky blue
  accent: '#FFDD7F', // Pale yellow
  background: '#F4F4F9', // Off-white
  warm: '#F1E0C6', // Light beige
  text: '#5A5A5A', // Soft dark gray for text
};

interface HabitItemProps {
  id: string;
  title: string;
  category: string;
  icon: React.ReactNode;
  completed: boolean;
  onToggle: (id: string) => void;
}

export default function HabitItem({ id, title, category, icon, completed, onToggle }: HabitItemProps) {
  const scale = useSharedValue(1);
  const checkOpacity = useSharedValue(completed ? 1 : 0);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });
  
  const checkAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: checkOpacity.value,
    };
  });

  const handlePress = () => {
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1);
    });
    
    checkOpacity.value = withTiming(completed ? 0 : 1, {
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    
    onToggle(id);
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[styles.container, animatedStyle, completed && styles.completedContainer]}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.category}>{category}</Text>
        </View>
        <View style={styles.checkboxContainer}>
          <View style={[styles.checkbox, completed && styles.checkboxCompleted]}>
            <Animated.View style={checkAnimatedStyle}>
              <Check size={16} color="#FFFFFF" />
            </Animated.View>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
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
  completedContainer: {
    backgroundColor: '#F8F8F8',
    opacity: 0.8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.secondary + '40',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 2,
  },
  category: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#888888',
  },
  checkboxContainer: {
    marginLeft: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DDDDDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
});