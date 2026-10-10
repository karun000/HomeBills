import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Screen from '../components/Screen';
import AppHeader from '../components/AppHeader';
import Card from '../components/Card';
import MonthPill from '../components/MonthPill';
import DonutChart from '../components/DonutChart';
import Icon from '../components/Icon';
import { categories, money } from '../data/mock';
import { useBills } from '../context/BillsContext';
import { useTheme } from '../context/ThemeContext';
import { colors } from '../theme';
import { useLanguage } from '../context/LanguageContext';

export default function InsightsScreen() {
  const { bills } = useBills();
  const { colors: theme } = useTheme();
  const { t } = useLanguage();
  const liveCategories = Object.values(bills.reduce<Record<string, { name: string; pct: number; amount: number; color: string }>>((a, b) => { const key = b.category; a[key] = a[key] || { name: key, pct: 0, amount: 0, color: b.tint }; a[key].amount += b.amount || 0; return a; }, {}));
  const total = liveCategories.reduce((s, c) => s + c.amount, 0); liveCategories.forEach(c => { c.pct = total ? Math.round(c.amount / total * 100) : 0; });
  const shownCategories = liveCategories.length ? liveCategories : categories;
  return (
    <Screen>
      <AppHeader title={t('Insights')} showLogo />
      <View style={{ alignItems: 'flex-end', marginBottom: 10 }}><MonthPill /></View>

      <Card>
        <View style={styles.between}>
          <View>
            <Text style={[styles.muted, { color: theme.muted }]}>{t('Total Spent')}</Text>
            <Text style={[styles.big, { color: theme.text }]}>{money(total)}</Text>
            <View style={styles.row}>
              <View style={styles.delta}>
                <Icon name="mdi:arrow-down" size={12} color={colors.green} />
                <Text style={{ color: colors.green, fontWeight: '700', fontSize: 11 }}>12%</Text>
              </View>
              <Text style={[styles.muted, { color: theme.muted }]}>{t('vs last month')}</Text>
            </View>
          </View>
          <View style={styles.chartIcon}><Icon name="mdi:chart-bar" size={22} color={colors.primary} /></View>
        </View>
      </Card>

      <Card style={{ marginTop: 14 }}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>{t('Spending by Category')}</Text>
        <DonutChart total={money(total)} data={shownCategories} />
        <View style={{ marginTop: 14, gap: 8 }}>
          {shownCategories.map((c) => (
            <View key={c.name} style={styles.row}>
              <View style={[styles.dot, { backgroundColor: c.color }]} />
              <Text style={[styles.catName, { color: theme.text }]}>{c.name}</Text>
              <Text style={styles.pct}>{c.pct}%</Text>
              <Text style={styles.amt}>{money(c.amount)}</Text>
            </View>
          ))}
        </View>
        {/* <View style={styles.saved}>
          <Icon name="mdi:leaf" size={22} color={colors.green} />
          <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '700', color: theme.text }}>You saved $53.20</Text>
          <Text style={[styles.muted, { color: theme.muted }]}>{t('compared to last month!')}</Text>
          </View>
          <Icon name="mdi:chevron-right" size={20} color={colors.green} />
        </View> */}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  between: { flexDirection: 'row', justifyContent: 'space-between' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  muted: { fontSize: 11, color: colors.muted },
  big: { fontSize: 28, fontWeight: '800', color: colors.text, marginVertical: 2 },
  delta: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.greenBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  chartIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontWeight: '700', color: colors.text, marginBottom: 12 },
  dot: { width: 9, height: 9, borderRadius: 5 },
  catName: { flex: 1, fontSize: 12, color: colors.text },
  pct: { width: 40, fontSize: 12, color: colors.muted, textAlign: 'right' },
  amt: { width: 70, fontSize: 12, fontWeight: '700', color: colors.text, textAlign: 'right' },
  saved: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.greenBg, borderRadius: 14, padding: 12, marginTop: 16 },
});
