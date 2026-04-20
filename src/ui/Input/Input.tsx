import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radii, spacing } from '@/theme/tokens';
import { fontFamily, fontSize } from '@/theme/typography';

export type InputProps = Omit<TextInputProps, 'style'> & {
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  maxLength?: number;
  showCounter?: boolean;
  error?: string;
  containerStyle?: ViewStyle;
};

export function Input({
  value,
  onChangeText,
  multiline = false,
  maxLength,
  showCounter = false,
  error,
  containerStyle,
  placeholder,
  ...rest
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const hasError = !!error;

  return (
    <View style={[styles.wrap, containerStyle]}>
      <TextInput
        {...rest}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        maxLength={maxLength}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          focused && styles.focused,
          hasError && styles.errored,
        ]}
        accessibilityLabel={rest.accessibilityLabel ?? placeholder}
      />
      <View style={styles.footer}>
        {hasError ? <Text style={styles.error}>{error}</Text> : <View />}
        {showCounter && maxLength !== undefined && (
          <Text style={styles.counter}>
            {value.length}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  input: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.text,
    minHeight: 48,
  },
  inputMultiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  focused: {
    borderColor: colors.primary,
  },
  errored: {
    borderColor: colors.danger,
  },
  footer: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
  },
  counter: {
    color: colors.muted,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    marginLeft: 'auto',
  },
});
