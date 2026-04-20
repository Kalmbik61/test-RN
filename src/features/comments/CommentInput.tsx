import { Platform, KeyboardAvoidingView, StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { ApiError } from '@/api/types';
import { Button } from '@/ui/Button/Button';
import { Input } from '@/ui/Input/Input';
import { spacing } from '@/theme/tokens';
import { useAddComment } from './useAddComment';

const MAX_LENGTH = 500;

type Props = {
  postId: string;
};

export function CommentInput({ postId }: Props) {
  const [text, setText] = useState('');
  const [inlineError, setInlineError] = useState<string | undefined>();

  const { mutate, isPending } = useAddComment(postId);

  const handleSend = () => {
    setInlineError(undefined);
    mutate(text, {
      onSuccess: () => {
        setText('');
      },
      onError: (err) => {
        if (err instanceof ApiError && err.status === 400) {
          setInlineError(err.message || 'Неверный запрос');
        }
      },
    });
  };

  const isOverLimit = text.length > MAX_LENGTH;
  const isDisabled = text.trim().length === 0 || isOverLimit || isPending;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <Input
          value={text}
          onChangeText={(t) => {
            setText(t);
            if (inlineError) setInlineError(undefined);
          }}
          maxLength={MAX_LENGTH + 1}
          showCounter
          multiline
          placeholder="Напишите комментарий..."
          error={inlineError}
          accessibilityLabel="Поле ввода комментария"
        />
        <View style={styles.buttonRow}>
          <Button
            title="Отправить"
            onPress={handleSend}
            disabled={isDisabled}
            loading={isPending}
            accessibilityLabel="Отправить комментарий"
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  buttonRow: {
    alignSelf: 'flex-end',
  },
});
