import React from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import Screen from '../components/Screen';
import AppHeader from '../components/AppHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import Icon from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

type RowProps = { icon: string; color: string; title: string; sub?: string; right?: React.ReactNode };

function Row({ icon, color, title, sub, right }: RowProps) {
  const { colors: theme } = useTheme();
  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.7}>
      <Icon name={icon} size={22} color={color} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        {sub && <Text style={[styles.sub, { color: theme.muted }]}>{sub}</Text>}
      </View>
      {right ?? <Icon name="mdi:chevron-right" size={20} color={colors.muted} />}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { dark, setDark, colors: theme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  return (
    <Screen>
      <AppHeader title={t('Settings')} />
      <Card style={{ padding: 8 }}>
        <Row icon="mdi:account-circle" color="#F2B38A" title={user?.name ?? 'Alex Johnson'} sub={user?.email} />
      </Card>

      <Card style={styles.group}>
        <Row icon="mdi:bell" color={colors.primary} title={t('Notifications')} sub={t('Bill reminders and alerts')} />
        <Row icon="mdi:calendar-sync-outline" color={colors.primary} title={t('Recurring Reminders')} sub={t('Manage reminder preferences')} />
        <Row icon="mdi:view-grid" color={colors.primary} title={t('Payment Categories')} sub={t('Customize your bill categories')} />
        <Row icon="mdi:currency-usd-circle" color={colors.primary} title={t('Currency')} sub="NPR (रु)" />
      </Card>

      <Card style={styles.group}>
        <Row icon="mdi:weather-night" color={theme.text} title={t('Dark Mode')}
          right={<Switch value={dark} onValueChange={setDark} trackColor={{ true: colors.primary }} />} />
        <Row icon="mdi:cloud-upload" color={colors.primary} title={t('Backup & Sync')} sub={t('Keep your data safe')} />
        <View style={styles.languageRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: theme.text }]}>Language / भाषा</Text>
            <Text style={[styles.sub, { color: theme.muted }]}>Choose your app language</Text>
          </View>
          <View style={[styles.languageSwitch, { borderColor: theme.border }]}>
            <TouchableOpacity onPress={() => setLanguage('en')} style={[styles.languageButton, language === 'en' && { backgroundColor: theme.primary }]}>
              <Text style={{ color: language === 'en' ? '#fff' : theme.text, fontWeight: '700', fontSize: 12 }}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setLanguage('ne')} style={[styles.languageButton, language === 'ne' && { backgroundColor: theme.primary }]}>
              <Text style={{ color: language === 'ne' ? '#fff' : theme.text, fontWeight: '700', fontSize: 12 }}>नेपाली</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>

      <Card style={styles.group}>
        <Row icon="mdi:help-circle" color={colors.green} title={t('Help & Support')} />
        <Row icon="mdi:shield-check" color={colors.orange} title={t('Privacy Policy')} />
        <Row icon="mdi:information" color={colors.primary} title={t('About Home Bills')} right={<Text style={styles.sub}>Version 1.0.0</Text>} />
      </Card>

      <Button title={t('Sign Out')} variant="outline" onPress={signOut} style={{ marginTop: 16 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { marginTop: 14, padding: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  languageRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  languageSwitch: { flexDirection: 'row', borderWidth: 1, borderRadius: 9, overflow: 'hidden' },
  languageButton: { paddingHorizontal: 9, paddingVertical: 7 },
  title: { fontWeight: '600', color: colors.text, fontSize: 14 },
  sub: { fontSize: 11, color: colors.muted },
});
