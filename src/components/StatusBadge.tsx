import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Status, statusStyle } from '../data/mock';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function StatusBadge({ status }: { status: Status }) {
  const { t } = useLanguage();
  const { dark } = useTheme();
  const s = statusStyle[status];
  return (
    <View style={[styles.badge, { backgroundColor: dark ? s.fg + '35' : s.bg }]}>
      <Text style={[styles.text, { color: s.fg }]}>{t(status)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  text: { fontSize: 11, fontWeight: '700' },
});
