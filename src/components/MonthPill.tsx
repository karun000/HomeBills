import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import Icon from './Icon';
import { colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { bsMonthLabel, todayBs } from '../utils/nepaliDate';

export default function MonthPill({ label }: { label?: string }) {
  const { colors: theme } = useTheme();
  const [year, month] = todayBs().split('-').map(Number);
  return (
    <TouchableOpacity style={[styles.pill, { backgroundColor: theme.bg }]}>
      <Text style={[styles.text, { color: theme.text }]}>{label || bsMonthLabel(year, month)}</Text>
      <Icon name="mdi:chevron-down" size={16} color={colors.muted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.bg,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10,
  },
  text: { fontSize: 12, fontWeight: '600', color: colors.text },
});
