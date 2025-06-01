import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { router } from "expo-router";

import { useGoogleAuth } from "../../utils/auth";

export const AuthScreen = () => {
  const { signInWithGoogle, isLoading } = useGoogleAuth();

  const handleGoogleSignIn = async () => {
    const success = await signInWithGoogle();
    if (success) {
      router.replace("/(app)/home");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../../../assets/icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text variant="headlineMedium" style={styles.title}>
          Welcome to EveryNote
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Your personal note-taking companion
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleGoogleSignIn}
          loading={isLoading}
          style={styles.button}
          icon="google"
        >
          Continue with Google
        </Button>

        <Button
          mode="outlined"
          onPress={() => {}}
          style={styles.button}
          icon="apple"
        >
          Continue with Apple
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    justifyContent: "space-between",
  },
  logoContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
  },
  buttonContainer: {
    width: "100%",
    paddingBottom: 40,
  },
  button: {
    marginVertical: 8,
    paddingVertical: 6,
  },
});
