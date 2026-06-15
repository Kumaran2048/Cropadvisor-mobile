import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

// Contexts
import { ThemeProvider } from './src/contexts/ThemeContext';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { AppDataProvider } from './src/contexts/AppDataContext';

// Pages
import Login from './src/pages/Login';
import Register from './src/pages/Register';
import MainLayout from './src/components/layout/MainLayout';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppDataProvider>
            <NavigationContainer>
              <StatusBar style="auto" />
              <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Register" component={Register} />
                <Stack.Screen name="MainLayout" component={MainLayout} />
              </Stack.Navigator>
            </NavigationContainer>
          </AppDataProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
