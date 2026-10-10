import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from './Icon';
import StatusBadge from './StatusBadge';
import { Bill, money } from '../data/mock';
import { colors, radius, shadow } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { adToBs, formatBsLong } from '../utils/nepaliDate';

const paidDateLabel = (value: string, language: 'en' | 'ne') => {
  try {
    return formatBsLong(adToBs(value), language);
  } catch {
    return value.slice(0, 10);
  }
};

export default function BillRow({ bill, onPress, onLongPress, selected = false, selectionMode = false }: { bill: Bill; onPress?: () => void; onLongPress?: () => void; selected?: boolean; selectionMode?: boolean }) {
  const { colors: theme } = useTheme();
  const { t, language } = useLanguage();
  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.row, { backgroundColor: selected ? theme.primarySoft : theme.card, borderColor: selected ? theme.primary : 'transparent' }]}
      activeOpacity={0.8}
    >
      {selectionMode ? (
        <View style={[styles.selectionMark, { borderColor: selected ? theme.primary : theme.muted, backgroundColor: selected ? theme.primary : 'transparent' }]}>
          {selected && <Icon name="mdi:check-circle" size={16} color="#fff" />}
        </View>
      ) : (
        <Icon name={bill.icon} size={28} color={bill.tint} />
      )}
      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.text }]}>{bill.name}</Text>
        <Text style={[styles.amount, { color: theme.text }]}>{bill.amount == null ? t('Awaiting Reading') : money(bill.amount)}</Text>
        {bill.category === 'Electricity' && <Text style={styles.detail}>{bill.units ?? '—'} units × {bill.rate ?? '—'}</Text>}
        <Text style={[styles.detail, { color: theme.muted }]}>{t('Date')}: {formatBsLong(bill.date, language)}</Text>
        {bill.paidAt && <Text style={[styles.detail, { color: theme.muted }]}>{t('Paid on')}: {paidDateLabel(bill.paidAt, language)}</Text>}
      </View>
      <StatusBadge status={bill.status} />
      {selectionMode ? (
        <View style={styles.trailingSpace} />
      ) : (
        <Icon name="mdi:chevron-right" size={20} color={colors.muted} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card,
    borderRadius: radius.md, borderWidth: 1, padding: 14, marginBottom: 10, ...shadow,
  },
  selectionMark: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  trailingSpace: { width: 20 },
  info: { flex: 1 },
  name: { fontWeight: '700', color: colors.text, fontSize: 14 },
  amount: { fontWeight: '700', color: colors.text, fontSize: 15, marginTop: 1 },
  detail: { fontSize: 11, color: colors.muted, marginTop: 1 },
});
