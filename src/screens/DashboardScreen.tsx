import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Screen from '../components/Screen';
import AppHeader from '../components/AppHeader';
import Card from '../components/Card';
import MonthPill from '../components/MonthPill';
import BarMini from '../components/BarMini';
import StatChip from '../components/StatChip';
import SectionHeader from '../components/SectionHeader';
import Icon from '../components/Icon';
import StatusBadge from '../components/StatusBadge';
import { money } from '../data/mock';
import { useBills } from '../context/BillsContext';
import { colors, radius, shadow } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { formatBsLong } from '../utils/nepaliDate';

export default function DashboardScreen({ navigation }: any) {
  const { bills } = useBills();
  const { colors: theme } = useTheme();
  const { t, language } = useLanguage();
  const unpaid = bills.filter(b => b.status === 'Unpaid').slice(0, 3);
  const total = bills.filter(b => b.status === 'Unpaid').reduce((sum, bill) => sum + (bill.amount || 0), 0);
  return (
    <Screen>
      <AppHeader title="Home Bills" showLogo onSettings={() => navigation.navigate('More')} />

      <Card>
        <View style={styles.between}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>{t('Monthly Summary')}</Text>
          <MonthPill />
        </View>
        <View style={[styles.between, { alignItems: 'flex-end', marginTop: 8 }]}>
          <View>
            <Text style={[styles.big, { color: theme.text }]}>{money(total)}</Text>
            <Text style={[styles.muted, { color: theme.muted }]}>{t('Total Unpaid')}</Text>
          </View>
          <BarMini bills={bills} />
        </View>
        <View style={styles.chips}>
          <StatChip icon="mdi:check-circle" fg={colors.green} bg={colors.greenBg} value={bills.filter(b=>b.status==='Paid').length} label={t('Paid')} />
          <StatChip icon="mdi:clock-outline" fg={colors.orange} bg={colors.orangeBg} value={bills.filter(b=>b.status==='Unpaid').length} label={t('Unpaid')} />
          <StatChip icon="mdi:alert-circle" fg={colors.red} bg={colors.redBg} value={bills.filter(b=>b.status==='Awaiting Reading').length} label={t('Awaiting Reading')} />
        </View>
      </Card>

      <SectionHeader title={t('Unpaid Bills')} action={t('View All')} onAction={() => navigation.navigate('Bills')} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {unpaid.map((b) => (
          <TouchableOpacity key={b.id} onPress={() => navigation.navigate('AddBill', { billId: b.id })} style={[styles.upCard, { backgroundColor: theme.card }]}>
            <Icon name={b.icon} size={26} color={b.tint} />
            <Text style={[styles.upName, { color: theme.text }]}>{b.name}</Text>
            <Text style={[styles.upAmt, { color: theme.text }]}>{b.amount == null ? t('Awaiting Reading') : money(b.amount)}</Text>
            <Text style={[styles.muted, { color: theme.muted, fontSize: 10, marginBottom: 8 }]}>{t('Date')}: {formatBsLong(b.date, language)}</Text>
            <StatusBadge status={b.status} />
            {b.category === 'Electricity' && <Text style={[styles.muted, { color: theme.muted }]}>{b.units ?? '—'} units × {b.rate ?? '—'}</Text>}
          </TouchableOpacity>
        ))}
      </View>

      <SectionHeader title={t('Quick Actions')} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Action icon="mdi:plus" label={t('Add Bill')} bg={colors.primary} fg="#fff" onPress={() => navigation.navigate('AddBill')} />
        <Action icon="mdi:calendar-check-outline" label={t('View Calendar')} bg={theme.card} fg={theme.text} onPress={() => navigation.navigate('Calendar')} />
        <Action icon="mdi:chart-bar" label={t('See Insights')} bg={theme.card} fg={theme.teal} onPress={() => navigation.navigate('Insights')} />
      </View>
    </Screen>
  );
}

function Action({ icon, label, bg, fg, onPress }: any) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.action, { backgroundColor: bg }]}>
      <Icon name={icon} size={30} color={fg === '#fff' ? '#fff' : fg} />
      <Text style={[styles.actionText, { color: fg === colors.teal ? colors.text : fg }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontWeight: '700', fontSize: 14, color: colors.text },
  big: { fontSize: 32, fontWeight: '800', color: colors.text },
  muted: { color: colors.muted, fontSize: 11 },
  chips: { flexDirection: 'row', gap: 8, marginTop: 14 },
  upCard: { flex: 1, backgroundColor: colors.card, borderRadius: radius.md, padding: 12, ...shadow, gap: 2 },
  upName: { fontSize: 12, fontWeight: '600', color: colors.text, marginTop: 6 },
  upAmt: { fontSize: 15, fontWeight: '800', color: colors.text },
  action: { flex: 1, height: 100, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', gap: 8 },
  actionText: { fontSize: 11, fontWeight: '600' },
});
