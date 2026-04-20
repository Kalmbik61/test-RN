import { StyleSheet, Text } from 'react-native';
import type { Post } from '@/api/posts';
import { colors } from '@/theme/tokens';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';
import { PaidGate } from './PaidGate';

type Props = { post: Post };

export function PostBody({ post }: Props) {
  if (post.tier === 'paid' && !post.body) {
    return <PaidGate />;
  }
  return <Text style={styles.body}>{post.body}</Text>;
}

const styles = StyleSheet.create({
  body: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    lineHeight: lineHeight.lg,
    color: colors.text,
  },
});
