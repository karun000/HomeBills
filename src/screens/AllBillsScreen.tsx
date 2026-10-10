import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Screen from '../components/Screen';
import AppHeader from '../components/AppHeader';
import BillRow from '../components/BillRow';
import Button from '../components/Button';
import Icon from '../components/Icon';
import { useBills } from '../context/BillsContext';
import { colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const filters = ['All', 'Unpaid', 'Paid', 'Awaiting Reading'] as const;

export default function AllBillsScreen({ navigation }: any) {
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { bills, removeBills, syncError } = useBills();
  const { colors: theme } = useTheme();
  const { t } = useLanguage();
  const list = bills.filter(
    (b) => (filter === 'All' || b.status === filter) && b.name.toLowerCase().includes(query.toLowerCase()),
  );
  const selectionMode = selectedIds.length > 0;
  const toggleSelection = (id: string) => setSelectedIds((current) => (
    current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id]
  ));
  const deleteSelected = () => Alert.alert(
    'Delete selected bills?',
    `This will permanently delete ${selectedIds.length} ${selectedIds.length === 1 ? 'bill' : 'bills'}.`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await removeBills(selectedIds);
          setSelectedIds([]);
        },
      },
    ],
  );

  return (
    <Screen>
      <AppHeader title="Home Bills" showLogo onSettings={() => navigation.navigate('More')} />
      {syncError && (
        <View style={[styles.syncWarning, { backgroundColor: theme.card, borderColor: '#D92D20' }]}>
          <Text style={[styles.syncWarningText, { color: '#D92D20' }]}>{syncError}</Text>
        </View>
      )}
      <View style={[styles.search, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
        <Icon name="mdi:magnify" size={20} color={colors.muted} />
        <TextInput placeholder={t('Search bills...')} placeholderTextColor={theme.muted} value={query} onChangeText={setQuery} style={{ flex: 1, color: theme.text }} />
      </View>
      <View style={styles.filters}>
        {filters.map((f) => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[styles.pill, { backgroundColor: filter === f ? theme.primary : theme.card }, filter === f && styles.pillOn]}>
            <Text style={[styles.pillText, { color: filter === f ? '#fff' : theme.text }]}>{t(f)}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {selectionMode && (
        <View style={styles.selectionBar}>
          <Text style={[styles.selectionCount, { color: theme.text }]}>{selectedIds.length} {t('selected')}</Text>
          <TouchableOpacity onPress={() => setSelectedIds([])} accessibilityRole="button">
            <Text style={[styles.cancelSelection, { color: theme.muted }]}>{t('Cancel')}</Text>
          </TouchableOpacity>
          <Button title={`Delete ${selectedIds.length}`} icon="mdi:delete" onPress={deleteSelected} style={styles.deleteButton} />
        </View>
      )}
      {list.map((bill) => (
        <BillRow
          key={bill.id}
          bill={bill}
          selected={selectedIds.includes(bill.id)}
          selectionMode={selectionMode}
          onLongPress={() => setSelectedIds((current) => current.includes(bill.id) ? current : [...current, bill.id])}
          onPress={() => selectionMode
            ? toggleSelection(bill.id)
            : navigation.navigate('AddBill', { billId: bill.id })}
        />
      ))}
      <Button title={t('Add Bill')} icon="mdi:plus" onPress={() => navigation.navigate('AddBill')} style={{ marginTop: 6 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#E9EEF7',
    borderRadius: 14, paddingHorizontal: 14, height: 46, marginBottom: 12,
  },
  filters: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  selectionBar: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  syncWarning: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, marginBottom: 14 },
  syncWarningText: { fontSize: 12, fontWeight: '600' },
  selectionCount: { flex: 1, fontWeight: '700' },
  cancelSelection: { fontWeight: '600', paddingVertical: 10 },
  deleteButton: { height: 42, borderRadius: 10, paddingHorizontal: 14 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, backgroundColor: '#E9EEF7' },
  pillOn: { backgroundColor: colors.primary },
  pillText: { fontSize: 12, fontWeight: '600', color: colors.text },
});
