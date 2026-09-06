// Mobile app entry point with Firebase initialization
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/stack';

import { AuthStack } from './navigation/AuthStack';
import { AppStack } from './navigation/AppStack';
import { LoadingScreen } from './screens/LoadingScreen';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BusinessProvider } from './context/BusinessContext';
import { EntitlementProvider } from './context/EntitlementContext';
import { initializeFirebase } from './services/firebase.service';

SplashScreen.keepAsync();

const Stack = createNativeStackNavigator();

/**
 * Initialize Firebase once at app startup
 */
let firebaseInitialized = false;

function initializeApp() {
  if (!firebaseInitialized) {
    try {
      initializeFirebase();
      firebaseInitialized = true;
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Firebase initialization error:', error);
      // In a real app, you might show an error screen here
      // For now, we'll let it fail when services try to use Firebase
    }
  }
}

/**
 * Main app navigator that switches between Auth and App stacks
 * This component uses the useAuth hook, so it must be inside AuthProvider
 */
function MainNavigator() {
  const { state } = useAuth();

  if (state.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animationEnabled: true,
        }}
      >
        {state.userToken == null ? (
          <Stack.Group screenOptions={{ animationEnabled: false }}>
            <Stack.Screen name="Auth" component={AuthStack} />
          </Stack.Group>
        ) : (
          <Stack.Group screenOptions={{ animationEnabled: false }}>
            <Stack.Screen name="App" component={AppStack} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

/**
 * Root component with all providers and navigation
 */
function RootApp() {
  return (
    <AuthProvider>
      <BusinessProvider>
        <EntitlementProvider>
          <MainNavigator />
          <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        </EntitlementProvider>
      </BusinessProvider>
    </AuthProvider>
  );
}

/**
 * App entry point
 */
export default function App() {
  // Initialize Firebase once
  useEffect(() => {
    initializeApp();
  }, []);

  // Hide splash screen after a short delay
  useEffect(() => {
    const hideSplash = async () => {
      await SplashScreen.hideAsync();
    };
    hideSplash();
  }, []);

  return <RootApp />;
}
