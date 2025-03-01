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

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#888888',
  },
});