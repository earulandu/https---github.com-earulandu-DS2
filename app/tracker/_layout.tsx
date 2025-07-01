// app/tracker/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';

export default function TrackerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="[roomCode]"
        options={{
          animation: 'slide_from_right',
          headerShown: true,
          headerTitle: 'Match Tracker',
        }}
      />
      <Stack.Screen
        name="join/page"
        options={{
          animation: 'slide_from_bottom',
          headerShown: true,
          headerTitle: 'Join Match',
        }}
      />
    </Stack>
  );
}
