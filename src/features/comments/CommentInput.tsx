import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ApiError } from '@/api/types';
import { SendIcon } from '@/ui/icons/SendIcon';
import { colors, radii, spacing } from '@/theme/tokens';
import { fontFamily, fontSize } from '@/theme/typography';
import { useAddComment } from './useAddComment';

const MAX_LENGTH = 500;

type Props = {
  postId: string;
};

export function CommentInput({ postId }: Props) {
  const [text, setText] = useState('');
  const [inlineError, setInlineError] = useState<string | undefined>();

  const { mutate, isPending } = useAddComment(postId);

  const isOverLimit = text.length > MAX_LENGTH;
  const isDisabled = text.trim().length === 0 || isOverLimit || isPending;

  const handleSend = () => {
    if (isDisabled) return;
    setInlineError(undefined);
    mutate(text, {
      onSuccess: () => setText(''),
      onError: (err) => {
        if (err instanceof ApiError && err.status === 400) {
          setInlineError(err.message || 'Неверный запрос');
        }
      },
    });
  };

  const sendColor = isDisabled ? colors.primaryDisabled : colors.primary;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.wrap}>
        <View style={[styles.pill, inlineError ? styles.pillError : null]}>
          <TextInput
            value={text}
            onChangeText={(t) => {
              setText(t);
              if (inlineError) setInlineError(undefined);
            }}
            maxLength={MAX_LENGTH + 1}
            placeholder="Ваш комментарий"
            placeholderTextColor={colors.muted}
            style={styles.input}
            multiline
            accessibilityLabel="Поле ввода комментария"
          />
          <Pressable
            onPress={handleSend}
            disabled={isDisabled}
            accessibilityRole="button"
            accessibilityLabel="Отправить комментарий"
            hitSlop={8}
            style={styles.send}
          >
            <SendIcon size={24} color={sendColor} />
          </Pressable>
        </View>
        {inlineError ? <Text style={styles.error}>{inlineError}</Text> : null}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.bg,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingLeft: spacing.lg,
    paddingRight: spacing.xs,
    paddingVertical: 4,
    minHeight: 48,
  },
  pillError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.text,
    paddingVertical: spacing.sm,
    maxHeight: 120,
  },
  send: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    marginTop: spacing.xs,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.danger,
  },
});
