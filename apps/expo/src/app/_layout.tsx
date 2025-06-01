import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { Slot, StatusBar, useRouter, useSegments } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "nativewind";

import { queryClient } from "~/utils/api";
import { AuthScreen } from "../screens/auth/AuthScreen";

import "../styles.css";

import { QueryClientProvider } from "@tanstack/react-query";

// This is the main layout of the app
// It wraps your pages with the providers they need
export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated === null) return;

    const inAuthGroup = segments[0] === "(app)";

    if (!isAuthenticated && inAuthGroup) {
      // Redirect to the sign-in page
      router.replace("/");
    } else if (isAuthenticated && !inAuthGroup) {
      // Redirect to the home page
      router.replace("/(app)/home");
    }
  }, [isAuthenticated, segments]);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error("Error checking auth:", error);
      setIsAuthenticated(false);
    }
  };

  if (isAuthenticated === null) {
    return null; // Or a loading screen
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      {/*
          The Stack component displays the current page.
          It also allows you to configure your screens 
        */}
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#f472b6",
          },
          contentStyle: {
            backgroundColor: colorScheme == "dark" ? "#09090B" : "#FFFFFF",
          },
        }}
      >
        <Slot />
      </Stack>
      <StatusBar />
    </QueryClientProvider>
  );
}
