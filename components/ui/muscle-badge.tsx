import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MuscleGroup } from '../../constants/exercises';

interface MuscleBadgeProps {
  muscleGroup: MuscleGroup;
  size?: 'sm' | 'md';
}

export const MuscleBadge: React.FC<MuscleBadgeProps> = ({ muscleGroup, size = 'md' }) => {
  return (
    <View style={[
      styles.badge, 
      size === 'sm' ? styles.badgeSm : styles.badgeMd
    ]}>
      <Text style={[
        styles.text, 
        size === 'sm' ? styles.textSm : styles.textMd
      ]}>
        {muscleGroup}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 8,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E', // Minimalist neutral gray background
    borderWidth: 1,
    borderColor: '#252525', // Thin borders
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeMd: {
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  text: {
    fontWeight: '700',
    color: '#9CA3AF', // Luxury gray text
    letterSpacing: -0.1,
  },
  textSm: {
    fontSize: 11,
  },
  textMd: {
    fontSize: 12,
  },
});
