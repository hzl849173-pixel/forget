import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, TextInputProps } from 'react-native';

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
  allowDecimals?: boolean;
  isPrefilled?: boolean;
  prefilledColor?: string;
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
  allowDecimals = false,
  isPrefilled = false,
  prefilledColor,
}) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const [localText, setLocalText] = React.useState(value === 0 ? '' : value.toString());

  React.useEffect(() => {
    if (!isFocused) {
      setLocalText(value === 0 ? '' : value.toString());
    }
  }, [value, isFocused]);

  const handleDecrement = () => {
    if (value - step >= min) {
      const newVal = parseFloat((value - step).toFixed(2));
      onChange(newVal);
      setLocalText(newVal === 0 ? '' : newVal.toString());
    }
  };

  const handleIncrement = () => {
    if (value + step <= max) {
      const newVal = parseFloat((value + step).toFixed(2));
      onChange(newVal);
      setLocalText(newVal === 0 ? '' : newVal.toString());
    }
  };

  const handleTextChange = (rawText: string) => {
    let cleanText = rawText.replace(',', '.');

    if (!allowDecimals) {
      // Reps: integers only, no decimal points or commas allowed!
      cleanText = cleanText.replace(/[^0-9]/g, '');
    } else {
      // Weight: allow digits and a single decimal point
      cleanText = cleanText.replace(/[^0-9.]/g, '');
      const parts = cleanText.split('.');
      if (parts.length > 2) {
        cleanText = parts[0] + '.' + parts.slice(1).join('');
      }
    }

    setLocalText(cleanText);

    if (cleanText === '' || cleanText === '.') {
      onChange(0);
      return;
    }

    const numeric = parseFloat(cleanText);
    if (!isNaN(numeric)) {
      const clamped = Math.min(max, Math.max(min, numeric));
      onChange(clamped);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (localText === '' || localText === '.') {
      setLocalText('');
      onChange(0);
    } else {
      const numeric = parseFloat(localText);
      if (isNaN(numeric)) {
        setLocalText('');
        onChange(0);
      } else {
        const clamped = Math.min(max, Math.max(min, numeric));
        setLocalText(clamped === 0 ? '' : clamped.toString());
        onChange(clamped);
      }
    }
  };

  const activeBorderColor = accentColor || '#3B82F6';
  const effectiveTextColor = isPrefilled
    ? (prefilledColor || '#9CA3AF')
    : (textColor || '#111827');

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
        style={[styles.adjusterInput, { color: effectiveTextColor }]}
        keyboardType={allowDecimals ? 'decimal-pad' : 'number-pad'}
        value={isFocused ? localText : (value === 0 ? '' : value.toString())}
        placeholder={placeholder}
        placeholderTextColor={prefilledColor || '#9CA3AF'}
        onChangeText={handleTextChange}
        selectTextOnFocus
        onFocus={() => {
          setIsFocused(true);
          setLocalText(value === 0 ? '' : value.toString());
        }}
        onBlur={handleBlur}
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
