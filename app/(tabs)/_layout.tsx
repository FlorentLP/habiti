import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Chrome as Home, ChartBar as BarChart2, Plus, Settings } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';

// New color palette
const COLORS = {
  primary: '#A8D5BA', // Pastel green
  secondary: '#B3E0F2', // Soft sky blue
  accent: '#FFDD7F', // Pale yellow
  background: '#F4F4F9', // Off-white
  warm: '#F1E0C6', // Light beige
  text: '#5A5A5A', // Soft dark gray for text
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#A0A0A0',
        tabBarStyle: {
          ...styles.tabBar,
          ...(Platform.OS === 'ios' ? styles.tabBarIOS : {}),
        },
        tabBarBackground: () => 
          Platform.OS === 'ios' ? (
            <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="light" />
          ) : null,
        tabBarLabelStyle: styles.tabBarLabel,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: 'Habits',
          tabBarIcon: ({ color, size }) => <Plus color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size }) => <BarChart2 color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 0,
    elevation: 0,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  tabBarIOS: {
    backgroundColor: 'transparent',
  },
  tabBarLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
});