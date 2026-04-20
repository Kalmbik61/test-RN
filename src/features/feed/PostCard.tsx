import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import type { Post } from '@/api/posts';
import { Button, CommentsBadge, Likes } from '@/ui';
import { colors, radii, spacing } from '@/theme/tokens';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';
import { PostHeader } from '@/features/post/PostHeader';
import { useToggleLike } from '@/features/post/useToggleLike';
import MoneySvg from '../../../assets/icons/money.svg';

const PREVIEW_LIMIT = 90;

export function PostCard({ post, onPress }: { post: Post; onPress: () => void }) {
  const { mutate, isPending } = useToggleLike(post.id);
  const [expanded, setExpanded] = useState(false);
  const isPaid = post.tier === 'paid';
  const needsMore = post.preview.length > PREVIEW_LIMIT;

  return (
    <Pressable
      onPress={isPaid ? undefined : onPress}
      disabled={isPaid}
      accessibilityRole="button"
      accessibilityLabel={isPaid ? `Paid post ${post.title}` : `Open post ${post.title}`}
      style={styles.card}
    >
      <View style={styles.headerWrap}>
        <PostHeader
          author={post.author}
          createdAt={post.createdAt}
          isVerified={post.author.isVerified}
        />
      </View>

      {post.coverUrl ? (
        isPaid ? (
          <View style={styles.paidCover}>
            <Image
              source={{ uri: post.coverUrl }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={300}
              blurRadius={40}
              accessibilityLabel={`Paid cover for ${post.title}`}
            />
            <View style={styles.paidOverlay}>
              <View style={styles.moneyIconWrap}>
                <MoneySvg width={48} height={48} />
              </View>
              <Text style={styles.paidText}>
                Контент скрыт пользователем.{'\n'}Доступ откроется после доната
              </Text>
              <Button
                title="Отправить донат"
                onPress={() => {}}
                accessibilityLabel="Отправить донат"
                style={styles.paidButton}
              />
            </View>
          </View>
        ) : (
          <Image
            source={{ uri: post.coverUrl }}
            style={styles.cover}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={300}
            accessibilityLabel={`Cover image for ${post.title}`}
          />
        )
      ) : null}

      {!isPaid ? (
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={2}>
            {post.title}
          </Text>

          <View style={styles.previewWrap}>
            <Text style={styles.preview} numberOfLines={expanded ? undefined : 2}>
              {post.preview}
            </Text>
            {needsMore && !expanded ? (
              <View style={styles.moreOverlay} pointerEvents="box-none">
                <LinearGradient
                  colors={['rgba(255,255,255,0)', colors.bg]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.fade}
                />
                <Pressable
                  onPress={() => setExpanded(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Показать еще"
                  style={styles.morePress}
                  hitSlop={8}
                >
                  <Text style={styles.more}>Показать еще</Text>
                </Pressable>
              </View>
            ) : null}
          </View>

          <View style={styles.actions}>
            <Likes
              count={post.likesCount}
              isLiked={post.isLiked}
              disabled={isPending}
              onToggle={() => mutate()}
            />
            <CommentsBadge count={post.commentsCount} onPress={onPress} />
          </View>
        </View>
      ) : (
        <View style={styles.body}>
          <View style={styles.paidSkeleton1} />
          <View style={styles.paidSkeleton2} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  headerWrap: {
    paddingHorizontal: spacing.lg,
  },
  cover: {
    width: '100%',
    height: 393,
  },
  paidCover: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  paidOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  moneyIconWrap: {
    padding: 11,
    borderRadius: 10,
    backgroundColor: colors.moneyBg,
  },
  paidText: {
    color: colors.bg,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    textAlign: 'center',
  },
  paidButton: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  paidSkeleton1: {
    height: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.screenBg,
    width: '60%',
  },
  paidSkeleton2: {
    height: 32,
    borderRadius: radii.pill,
    backgroundColor: colors.screenBg,
    width: '100%',
  },
  body: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
    color: colors.text,
  },
  previewWrap: {
    position: 'relative',
  },
  preview: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    color: colors.text,
  },
  moreOverlay: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    height: lineHeight.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fade: {
    width: 40,
    height: '100%',
  },
  morePress: {
    backgroundColor: colors.bg,
    justifyContent: 'center',
    height: '100%',
  },
  more: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    color: colors.primary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});
