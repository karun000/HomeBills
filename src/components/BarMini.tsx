import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Bill } from '../data/mock';
import { colors } from '../theme';
import { adToBs, BS_MONTHS_EN, BS_MONTHS_NE, todayBs } from '../utils/nepaliDate';
import { useLanguage } from '../context/LanguageContext';

const graphDateFor = (bill: Bill) => {
  if (!bill.paidAt) return bill.date;
  try {
    return adToBs(bill.paidAt);
  } catch {
    return bill.date;
  }
};

export default function BarMini({ bills }: { bills: Bill[] }) {
  const { language } = useLanguage();
  const [currentYear, currentMonth] = todayBs().split('-').map(Number);
  const currentMonthIndex = currentYear * 12 + currentMonth - 1;
  const firstMonthIndex = currentMonthIndex - 5;
  const monthNames = language === 'ne' ? BS_MONTHS_NE : BS_MONTHS_EN;
  const monthlyBars = Array.from({ length: 6 }, (_, index) => {
    const monthIndex = firstMonthIndex + index;
    const month = monthIndex % 12;
    return {
      m: monthNames[month],
      monthIndex,
      amount: 0,
      active: index === 5,
    };
  });

  bills.forEach((bill) => {
    const match = /^(\d{4})-(\d{1,2})-\d{1,2}$/.exec(graphDateFor(bill));
    if (!match || bill.amount == null || !Number.isFinite(bill.amount)) return;
    const year = Number(match[1]);
    const month = Number(match[2]);
    if (month < 1 || month > 12) return;
    const monthIndex = year * 12 + month - 1;
    const bar = monthlyBars.find((item) => item.monthIndex === monthIndex);
    if (bar) bar.amount += bill.amount;
  });

  const maxAmount = Math.max(...monthlyBars.map((bar) => bar.amount));
  return (
    <View style={styles.row}>
      {monthlyBars.map((bar) => (
        <View key={bar.monthIndex} style={styles.col}>
          <View style={[styles.bar, { height: maxAmount ? Math.max(3, (bar.amount / maxAmount) * 64) : 3, backgroundColor: bar.active ? colors.primary : '#BBD4FA' }]} />
          <Text style={styles.label}>{bar.m}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 90 },
  col: { alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: 14, borderRadius: 4 },
  label: { fontSize: 8, color: colors.muted, marginTop: 3 },
});
