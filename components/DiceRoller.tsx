// app/components/DiceRoller.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons'; // This import is correct now
import React, { useState } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { ThemedText } from './themed/ThemedText';

interface DiceRollerProps {
  onRoll: (value: number) => void;
  disabled?: boolean;
  currentPlayer?: string;
}

const DiceRoller: React.FC<DiceRollerProps> = ({ 
  onRoll, 
  disabled = false,
  currentPlayer 
}) => {
  const { theme } = useTheme();
  const [rolling, setRolling] = useState(false);
  const [diceValue, setDiceValue] = useState(1);
  const spinValue = new Animated.Value(0);

  const rollDice = () => {
    if (disabled || rolling) return;

    setRolling(true);
    
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    const rollInterval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
    }, 100);

    setTimeout(() => {
      clearInterval(rollInterval);
      const finalValue = Math.floor(Math.random() * 6) + 1;
      setDiceValue(finalValue);
      setRolling(false);
      spinValue.setValue(0);
      onRoll(finalValue);
    }, 1000);
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '720deg'],
  });

  const getDiceFace = (value: number) => {
    const faces = ['dice-1', 'dice-2', 'dice-3', 'dice-4', 'dice-5', 'dice-6'];
    return faces[value - 1] || 'dice-1';
  };

  return (
    <View style={styles.container}>
      {currentPlayer && (
        <ThemedText variant="subtitle" style={styles.playerText}>
          {currentPlayer}'s Turn
        </ThemedText>
      )}
      
      <TouchableOpacity
        onPress={rollDice}
        disabled={disabled || rolling}
        style={[
          styles.diceContainer,
          { 
            backgroundColor: theme.colors.card,
            opacity: disabled ? 0.5 : 1,
          }
        ]}
      >
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <MaterialCommunityIcons // <--- THIS LINE HAS BEEN CHANGED TO MaterialCommunityIcons
            name={getDiceFace(diceValue) as any} 
            size={100} 
            color={theme.colors.primary} 
          />
        </Animated.View>
      </TouchableOpacity>

      <ThemedText variant="caption" style={styles.instruction}>
        {disabled ? 'Start the game to roll' : 'Tap to roll the dice'}
      </ThemedText>
    </View>
  );
};

export default DiceRoller;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 24,
  },
  playerText: {
    marginBottom: 16,
  },
  diceContainer: {
    padding: 40,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  instruction: {
    marginTop: 16,
  },
});