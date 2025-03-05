import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Switch, TouchableOpacity, Alert, Platform } from 'react-native';
import Header from '../../components/Header';
import { useHabits } from '../../context/HabitsContext';
import { Bell, Moon, Sun, CircleHelp, LogOut, Trash2 } from 'lucide-react-native';
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import { COLORS } from '@/context/constants';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/authContext';

export default function SettingsScreen() {
  const { habits } = useHabits();
  const { user, setUser } = useAuth(); // Assure-toi que ton authContext a bien setUser
  const router = useRouter();

  const [loading, setLoading] = useState(false); // New state to handle the loading during logout

  const handleLogout = async () => {
    try {
      setLoading(true); // Set loading state to true while waiting for signOut
      await signOut(auth); // Wait for the sign-out process
      setUser(null); // Set the user to null after sign out
      setLoading(false); // Set loading state to false once sign out is done
      router.replace("/login"); // Redirect to login screen after sign out
    } catch (error) {
      setLoading(false); // Ensure to set loading to false in case of an error
    }
  };

  useEffect(() => {
    if (user === null) {
      router.replace("/login"); // Redirect to login if the user is null
    }
  }, [user, router]);

  // Other states and functions like darkMode, notifications, etc.
  const [darkMode, setDarkMode] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);

  const toggleDarkMode = () => setDarkMode(previousState => !previousState);
  const toggleNotifications = () => setNotifications(previousState => !previousState);

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'Are you sure you want to reset all your habits and progress? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => Alert.alert('Data Reset', 'All your data has been reset.') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Header title="Settings" subtitle="Customize your experience" />

        <View style={styles.profileContainer}>
          <View style={styles.profileImagePlaceholder}>
            <Text style={styles.profileInitials}>JD</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>John Doe</Text>
            <Text style={styles.profileEmail}>john.doe@example.com</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{habits.length}</Text>
            <Text style={styles.statLabel}>Habits</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>7</Text>
            <Text style={styles.statLabel}>Days Streak</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>85%</Text>
            <Text style={styles.statLabel}>Completion</Text>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Bell size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Switch
              value={notifications}
              onValueChange={toggleNotifications}
              trackColor={{ false: '#DDDDDD', true: COLORS.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              {darkMode ? (
                <Moon size={20} color={COLORS.primary} />
              ) : (
                <Sun size={20} color={COLORS.primary} />
              )}
            </View>
            <Text style={styles.settingLabel}>Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#DDDDDD', true: COLORS.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Support</Text>

          <TouchableOpacity style={styles.settingButton}>
            <View style={styles.settingIconContainer}>
              <CircleHelp size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.settingLabel}>Help & Support</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingButton}
            onPress={handleLogout}
            disabled={loading} // Disable the button while loading
          >
            <View style={styles.settingIconContainer}>
              <LogOut size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.settingLabel}>{loading ? 'Logging out...' : 'Log Out'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingButton, styles.dangerButton]}
            onPress={handleResetData}
          >
            <View style={[styles.settingIconContainer, styles.dangerIcon]}>
              <Trash2 size={20} color="#FF9A9A" />
            </View>
            <Text style={[styles.settingLabel, styles.dangerText]}>Reset All Data</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
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
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profileImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInitials: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 24,
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#888888',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#888888',
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#EEEEEE',
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.secondary + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  dangerButton: {
    borderBottomWidth: 0,
  },
  dangerIcon: {
    backgroundColor: '#FFEBEE',
  },
  dangerText: {
    color: '#FF9A9A',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  versionText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#888888',
  },
});