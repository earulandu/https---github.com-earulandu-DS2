// app/_layout.tsx
import { supabase } from '@/supabase';
import { Session } from '@supabase/supabase-js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SplashScreen, Stack, useRouter, useSegments } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { ThemeProvider } from '../contexts/ThemeContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

console.log('🚀 _layout.tsx file loaded');

// Keep the native splash screen visible while the app initializes
SplashScreen.preventAutoHideAsync();

// Updated QueryClient with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const AuthContext = createContext<{ session: Session | null; isReady: boolean }>({
  session: null,
  isReady: false,
});

export const useAuth = () => useContext(AuthContext);

// Error Boundary Component for debugging
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('🔴 ErrorBoundary caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🔴 ErrorBoundary componentDidCatch:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            Something went wrong!
          </Text>
          <Text style={{ textAlign: 'center', color: '#666' }}>
            {this.state.error?.toString()}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

function RootLayoutNav() {
  console.log('🎯 RootLayoutNav rendering');
  
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  console.log('📍 Current segments:', segments);
  console.log('🔐 Session state:', session?.user?.id ? 'Logged in' : 'Not logged in');
  console.log('✅ isReady:', isReady);

  useEffect(() => {
    console.log('🔄 Setting up auth listener');
    
    // Fetch session and set up listener
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        console.log('📦 Initial session fetch:', session ? 'Session found' : 'No session');
        if (error) {
          console.error('❌ Error fetching session:', error);
        }
        setSession(session);
      })
      .finally(() => {
        console.log('✅ Setting isReady to true');
        setIsReady(true);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 Auth state changed:', event, session ? 'Session exists' : 'No session');
      setSession(session);
    });

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    console.log('🚦 Navigation effect triggered');
    console.log('  - isReady:', isReady);
    console.log('  - segments:', segments);
    
    if (!isReady) {
      console.log('⏳ Not ready yet, skipping navigation');
      return;
    }

    const current = segments.join('/');
    console.log('📍 Current path:', current);
    
    const isRoot = current === '' || current === '+not-found';
    console.log('🏠 Is root?', isRoot);

    // Only redirect from root or not-found to home — not from /auth/*
    if (isRoot) {
      console.log('🔀 Redirecting to home');
      router.replace('/(tabs)/home');
    }
  }, [isReady, segments, router]);

  const onLayoutRootView = useCallback(async () => {
    console.log('📱 onLayoutRootView called, isReady:', isReady);
    if (isReady) {
      console.log('🎭 Hiding splash screen');
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    console.log('⏳ Rendering null - not ready');
    return null;
  }

  console.log('🎨 Rendering main layout');

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <AuthContext.Provider value={{ session, isReady }}>
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen
            name="tracker/[roomCode]"
            options={{ animation: 'slide_from_right', headerShown: true, headerTitle: 'Match Tracker' }}
          />
          <Stack.Screen
            name="post/[id]"
            options={{
              title: 'Post',
              headerShown: true,
              headerStyle: {
                backgroundColor: '#fff',
              },
              headerTitleStyle: {
                fontSize: 18,
                fontWeight: '600',
              },
            }}
          />
        </Stack>
      </AuthContext.Provider>
    </View>
  );
}

export default function RootLayout() {
  console.log('🏁 RootLayout (main) rendering');
  
  try {
    return (
      <ErrorBoundary>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <RootLayoutNav />
            </ThemeProvider>
          </QueryClientProvider>
        </GestureHandlerRootView>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('💥 Error in RootLayout:', error);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Critical Error: {error?.toString()}</Text>
      </View>
    );
  }
}