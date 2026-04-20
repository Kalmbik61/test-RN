const PENDING_MS = 5000;
const pending = new Set<string>();

export function markPendingOwnComment(postId: string): void {
  pending.add(postId);
  setTimeout(() => pending.delete(postId), PENDING_MS);
}

export function hasPendingOwnComment(postId: string): boolean {
  return pending.has(postId);
}
