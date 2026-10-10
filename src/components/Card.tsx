import React, { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, shadow } from '../theme';
import { useTheme } from '../context/ThemeContext';

export default function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const { colors: theme } = useTheme();
  return <View style={[styles.card, { backgroundColor: theme.card }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, ...shadow },
});
