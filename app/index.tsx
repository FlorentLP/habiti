import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/authContext";

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth(); // Utilisation du contexte global

  useEffect(() => {
    if (loading) return; // Attendre que Firebase charge

    if (user) {
      router.replace("/(tabs)");
    } else {
      router.replace("/login");
    }
  }, [user, loading]); // Réagir aux changements de `user` et `loading`

  return null;
}
