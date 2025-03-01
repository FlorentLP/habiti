import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// New color palette
const COLORS = {
  primary: '#A8D5BA', // Pastel green
  secondary: '#B3E0F2', // Soft sky blue
  accent: '#FFDD7F', // Pale yellow
  background: '#F4F4F9', // Off-white
  warm: '#F1E0C6', // Light beige
  text: '#5A5A5A', // Soft dark gray for text
};

interface CategoryBadgeProps {
  category: string;
  selected?: boolean;
  onPress?: () => void;
}

const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case 'fitness':
      return '#F8B195'; // Soft coral
    case 'mindfulness':
      return '#B3E0F2'; // Soft sky blue
    case 'nutrition':
      return '#A8D5BA'; // Pastel green
    case 'productivity':
      return '#FFDD7F'; // Pale yellow
    case 'learning':
      return '#C5A3FF'; // Soft lavender
    default:
      return '#D8D8D8'; // Light gray
  }
};

export default function CategoryBadge({ category, selected = false, onPress }: CategoryBadgeProps) {
  const color = getCategoryColor(category);
  
  return (
    <View 
      style={[
        styles.container, 
        { backgroundColor: selected ? color : `${color}30` },
      ]}
    >
      <Text 
        style={[
          styles.text, 
          { color: selected ? '#FFFFFF' : COLORS.text }
        ]}
      >
        {category}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  text: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
  },
});