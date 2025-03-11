import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { SplashScreen } from "expo-router";
import { AuthProvider } from '@/context/authContext';
import { HabitProvider } from '@/context/HabitsContext';


declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

// Empêche l'écran de splash de se cacher avant le chargement complet
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-Italic": require("../assets/fonts/Poppins-Italic.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <HabitProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="tabs" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ title: "Connexion" }} />
          <Stack.Screen name="+not-found" options={{ title: "Oops!" }} />
        </Stack>
        <StatusBar style="auto" />
      </HabitProvider>
    </AuthProvider>
      );
}
