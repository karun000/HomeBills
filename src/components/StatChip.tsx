import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from './Icon';
import { useTheme } from '../context/ThemeContext';

type Props = { icon: string; fg: string; bg: string; value: number; label: string };

export default function StatChip({ icon, fg, bg, value, label }: Props) {
  const { dark } = useTheme();
  return (
    <View style={[styles.chip, { backgroundColor: dark ? fg + '35' : bg }]}>
      <Icon name={icon} size={24} color={fg} />
      <View>
        <Text style={[styles.value, dark && { color: '#F8FAFC' }]}>{value}</Text>
        <Text style={[styles.label, dark && { color: '#CBD5E1' }]}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 14 },
  value: { fontWeight: '800', fontSize: 15, color: '#0F172A' },
  label: { fontSize: 10, color: '#64748B' },
});
