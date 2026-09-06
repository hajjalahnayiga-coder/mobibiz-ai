// Mobile app entry point
import React, { useEffect } from 'react';
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
 * Initialize Firebase synchronously before any React components render.
 * This must happen at module level to avoid race conditions with context providers.
 */
try {
  initializeFirebase();
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Firebase initialization errors will be thrown to the app
  // This prevents the app from running in an invalid state
  throw error;
}

/**
 * Main app navigator that switches between Auth and App stacks.
 * This component uses the useAuth hook, so it must be inside AuthProvider.
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
 * Root component with all providers and navigation.
 * Firebase has already been initialized before this mounts.
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
 * App entry point.
 * Firebase initialization has already occurred at module load time.
 */
export default function App() {
  // Hide splash screen after a short delay
  useEffect(() => {
    const hideSplash = async () => {
      await SplashScreen.hideAsync();
    };
    hideSplash();
  }, []);

  return <RootApp />;
}
