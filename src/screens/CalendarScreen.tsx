import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Screen from '../components/Screen';
import AppHeader from '../components/AppHeader';
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';
import Icon from '../components/Icon';
import { money } from '../data/mock';
import { colors, radius, shadow } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { bsMonthLabel, getBsMonth, todayBs, formatBsLong, localizeDigits, BS_WEEKDAYS_EN, BS_WEEKDAYS_NE } from '../utils/nepaliDate';
import { useBills } from '../context/BillsContext';
import { useLanguage } from '../context/LanguageContext';

const mark = {
  unpaid: { bg: colors.orangeBg, border: colors.orange },
  paid: { bg: colors.greenBg, border: colors.green },
  soon: { bg: colors.orangeBg, border: colors.orange },
  today: { bg: '#DCE9FD', border: colors.primary },
};

export default function CalendarScreen() {
  const { colors: theme } = useTheme();
  const { language, t } = useLanguage();
  const { bills } = useBills();
  const current = todayBs().split('-').map(Number);
  const [year, setYear] = React.useState(current[0]);
  const [month, setMonth] = React.useState(current[1]);
  const monthInfo = getBsMonth(year, month);
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}-`;
  const monthBills = bills.filter((bill) => bill.date.startsWith(monthPrefix));
  const cells: (number | null)[] = [...Array(monthInfo.firstWeekday).fill(null), ...Array.from({ length: monthInfo.days }, (_, i) => i + 1)];
  const goMonth = (delta: number) => {
    const next = new Date(year, month - 1 + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth() + 1);
  };
  const dayMark = (day: number) => {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (date === todayBs()) return 'today' as const;
    const bill = monthBills.find((item) => item.date === date);
    if (!bill) return undefined;
    if (bill.status === 'Paid') return 'paid' as const;
    return 'unpaid' as const;
  };
  return (
    <Screen>
      <AppHeader title={t('Calendar')} showLogo />
      <Card>
        <View style={styles.nav}>
          <TouchableOpacity onPress={() => goMonth(-1)}><Icon name="mdi:chevron-left" size={22} /></TouchableOpacity>
          <Text style={[styles.month, { color: theme.text }]}>{bsMonthLabel(year, month, language)}</Text>
          <TouchableOpacity onPress={() => goMonth(1)}><Icon name="mdi:chevron-right" size={22} /></TouchableOpacity>
        </View>
        <View style={styles.grid}>
          {(language === 'ne' ? BS_WEEKDAYS_NE : BS_WEEKDAYS_EN).map((d) => <Text key={d} style={styles.dow}>{d}</Text>)}
          {cells.map((d, i) => {
            const m = d ? dayMark(d) : undefined;
            return (
              <View key={i} style={styles.cell}>
                {d && (
                  <View style={[styles.day, m && { backgroundColor: mark[m].bg, borderColor: mark[m].border, borderWidth: m === 'today' ? 0 : 1.5 }]}>
                    <Text style={[styles.dayText, { color: theme.text }]}>{localizeDigits(String(d), language)}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
        <View style={styles.legend}>
          <Legend color={colors.orange} label={t('Unpaid')} />
          <Legend color={colors.green} label={t('Paid')} />
        </View>
      </Card>

      <SectionHeader title={t('Recorded Bills')} action={t('View All')} />
      {monthBills.sort((a, b) => a.date.localeCompare(b.date)).map((r) => (
        <View key={r.id} style={[styles.rem, { backgroundColor: theme.card }]}>
          <View style={[styles.remIcon, { backgroundColor: r.tint + '22' }]}>
            <Icon name={r.icon} size={22} color={r.tint} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '700', color: theme.text }}>{r.name}</Text>
            <Text style={{ fontSize: 11 }}>
              <Text style={{ color: colors.muted }}>{r.amount == null ? 'Awaiting reading' : money(r.amount)} · </Text>
              <Text style={{ color: colors.muted }}>{formatBsLong(r.date, language)}</Text>
            </Text>
          </View>
          <Icon name="mdi:chevron-right" size={20} color={colors.muted} />
        </View>
      ))}
      {monthBills.length === 0 && <Text style={[styles.empty, { color: theme.muted }]}>{t('No bills recorded this BS month.')}</Text>}
    </Screen>
  );
}

const Legend = ({ color, label }: { color: string; label: string }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
    <Text style={{ fontSize: 11, color: colors.muted }}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  month: { fontWeight: '700', fontSize: 16, color: colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dow: { width: '14.28%', textAlign: 'center', fontSize: 10, color: colors.muted, marginBottom: 6 },
  cell: { width: '14.28%', alignItems: 'center', paddingVertical: 4 },
  day: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  dayText: { fontSize: 12, color: colors.text },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 18, marginTop: 10 },
  empty: { fontSize: 12, textAlign: 'center', marginBottom: 12 },
  rem: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card,
    borderRadius: radius.md, padding: 12, marginBottom: 8, ...shadow,
  },
  remIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
