import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import * as Haptics from 'expo-haptics';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const buttonStyles = [
    styles.btn,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${variant}`],
    styles[`text_${size}`],
    disabled && styles.textDisabled,
    textStyle,
  ];

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      disabled={disabled || loading}
      style={buttonStyles as ViewStyle[]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#000000' : '#10B981'} />
      ) : (
        <Text style={textStyles as TextStyle[]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    borderRadius: 99, // Perfect pill buttons
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  // Sizes
  sm: {
    height: 36,
  },
  md: {
    height: 46,
  },
  lg: {
    height: 54,
  },
  // Luxury variants
  primary: {
    backgroundColor: '#10B981', // Emerald Green Accent
  },
  secondary: {
    backgroundColor: '#13141C', // Obsidian background
    borderWidth: 1,
    borderColor: '#212330', // Gunmetal border
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.2,
    borderColor: '#212330',
  },
  danger: {
    backgroundColor: '#EF4444',
  },
  disabled: {
    backgroundColor: '#101014',
    borderColor: '#1A1B22',
    opacity: 0.5,
  },
  // Text Styles
  text: {
    fontWeight: '700', // Bold headings / buttons
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  text_sm: {
    fontSize: 13,
  },
  text_md: {
    fontSize: 15,
  },
  text_lg: {
    fontSize: 17,
  },
  text_primary: {
    color: '#000000', // Flagship high-contrast black text on green
  },
  text_secondary: {
    color: '#FFFFFF',
  },
  text_outline: {
    color: '#FFFFFF',
  },
  text_danger: {
    color: '#FFFFFF',
  },
  textDisabled: {
    color: '#4B5563',
  },
});
