import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const Card: React.FC<CardProps> = ({ children, style }) => {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 22, // Flagship large rounded corners
    padding: 20, // Spacious padding
    marginBottom: 16, // Spacious layout spacing
    backgroundColor: '#131B31', // Slate Navy Card Background
    borderWidth: 1,
    borderColor: '#222F50', // Navy Slate Borders
  },
});
