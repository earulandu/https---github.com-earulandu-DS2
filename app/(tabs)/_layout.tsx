// app/(tabs)/_layout.tsx
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, Redirect } from 'expo-router';
import { useAuth } from '../_layout';
import { FeedProvider } from '../../contexts/FeedContext';
import { View, Text, ActivityIndicator } from 'react-native';

console.log('📂 (tabs)/_layout.tsx loaded');

export default function TabLayout() {
  console.log('📂 TabLayout rendering');
  
  const { session, isReady } = useAuth();
  
  console.log('🔐 TabLayout - session:', session ? 'exists' : 'null');
  console.log('✅ TabLayout - isReady:', isReady);

  // Show loading while checking auth
  if (!isReady) {
    console.log('⏳ TabLayout - Not ready, showing loading');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  // Redirect to auth if no session
  if (!session) {
    console.log('🔀 TabLayout - No session, redirecting to auth');
    return <Redirect href="/(auth)/login" />;
  }

  console.log('✅ TabLayout - Rendering tabs');

  return (
    <FeedProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#007AFF',
          tabBarStyle: { backgroundColor: '#fff' },
          headerStyle: { backgroundColor: '#fff' },
          headerTitleStyle: { fontWeight: '600' },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="feed"
          options={{
            title: 'Feed',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="people" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings" color={color} size={size} />
            ),
          }}
        />
      </Tabs>
    </FeedProvider>
  );
}