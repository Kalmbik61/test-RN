/**
 * T3 — Likes component tests
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Likes } from './Likes';

jest.mock('react-native-get-random-values', () => ({}));
jest.mock('react-native-svg', () => ({
  __esModule: true,
  default: 'Svg',
  Path: 'Path',
}));

describe('Likes', () => {
  it('renders heart icon and count', () => {
    const { getByText, getByRole } = render(
      <Likes count={42} isLiked={false} onToggle={jest.fn()} />,
    );
    expect(getByText('42')).toBeTruthy();
    expect(getByRole('button')).toBeTruthy();
  });

  it('calls onToggle when pressed', () => {
    const onToggle = jest.fn();
    const { getByRole } = render(
      <Likes count={5} isLiked={false} onToggle={onToggle} />,
    );
    fireEvent.press(getByRole('button'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('does NOT call onToggle when disabled', () => {
    const onToggle = jest.fn();
    const { getByRole } = render(
      <Likes count={5} isLiked={false} onToggle={onToggle} disabled />,
    );
    fireEvent.press(getByRole('button'));
    expect(onToggle).not.toHaveBeenCalled();
  });
});
