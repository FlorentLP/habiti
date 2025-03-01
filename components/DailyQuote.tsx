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

const quotes = [
  {
    text: "Small daily improvements are the key to staggering long-term results."
  },
  {
    text: "Habits are the compound interest of self-improvement."
  },
  {
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
  },
  {
    text: "The secret of getting ahead is getting started."
  },
  {
    text: "Your daily habits define your future self."
  },
  {
    text: "The only way to do great work is to love what you do."
  },
  {
    text: "Success is the sum of small efforts, repeated day in and day out."
  }
];

export default function DailyQuote() {
  // Get a random quote based on the day
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const quoteIndex = dayOfYear % quotes.length;
  const quote = quotes[quoteIndex];

  return (
    <View style={styles.container}>
      <Text style={styles.quoteText}>{quote.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.warm,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quoteText: {
    fontFamily: 'Poppins-Italic',
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 24,
    textAlign: 'center',
  }
});