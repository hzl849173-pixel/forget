import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, TextInputProps } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Plus, Minus } from 'lucide-react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, style, ...props }) => {
  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          error ? styles.inputError : null,
          style,
        ]}
        placeholderTextColor="#6B7280"
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

interface IncrementInputProps {
  value: number;
  onChange: (val: number) => void;
  step?: number;
  min?: number;
  max?: number;
  placeholder?: string;
  accentColor?: string;
  style?: any;
  textColor?: string;
}

export const IncrementInput: React.FC<IncrementInputProps> = ({
  value,
  onChange,
  step = 1,
  min = 0,
  max = 999,
  placeholder = '0',
  accentColor,
  style,
  textColor,
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  const handleDecrement = () => {
    if (value - step >= min) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newVal = parseFloat((value - step).toFixed(2));
      onChange(newVal);
    }
  };

  const handleIncrement = () => {
    if (value + step <= max) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newVal = parseFloat((value + step).toFixed(2));
      onChange(newVal);
    }
  };

  const handleTextChange = (text: string) => {
    const numeric = parseFloat(text);
    if (isNaN(numeric)) {
      onChange(0);
    } else {
      onChange(Math.min(max, Math.max(min, numeric)));
    }
  };

  const activeBorderColor = accentColor || '#3B82F6';

  return (
    <View style={[
      styles.adjusterContainer,
      isFocused && { borderColor: activeBorderColor },
      style
    ]}>
      <TouchableOpacity
        style={styles.adjusterBtn}
        onPress={handleDecrement}
        activeOpacity={0.5}
      >
        <Minus size={16} color={accentColor || '#FFFFFF'} strokeWidth={3} />
      </TouchableOpacity>
      
      <TextInput
        style={[styles.adjusterInput, textColor ? { color: textColor } : null]}
        keyboardType="decimal-pad"
        value={value === 0 ? '' : value.toString()}
        placeholder={placeholder}
        placeholderTextColor="#6B7280"
        onChangeText={handleTextChange}
        selectTextOnFocus
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      
      <TouchableOpacity
        style={styles.adjusterBtn}
        onPress={handleIncrement}
        activeOpacity={0.5}
      >
        <Plus size={16} color={accentColor || '#FFFFFF'} strokeWidth={3} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 16, // Round rectangular inputs
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    backgroundColor: '#141414',
    borderColor: '#252525',
    color: '#FFFFFF',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  adjusterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 99, // Pill shape
    borderWidth: 1,
    height: 46, // Taller flagship card height
    width: '100%', // Flexible width
    maxWidth: 120, // Prevent overlapping and keep layout crisp
    backgroundColor: '#1C1C1E',
    borderColor: '#2D2D30',
  },
  adjusterBtn: {
    width: 34, // Wider tap target
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjusterInput: {
    flex: 1,
    height: '100%',
    textAlign: 'center',
    fontSize: 16, // Larger premium font
    fontWeight: '800', // Bold
    color: '#FFFFFF',
    padding: 0,
  },
});
