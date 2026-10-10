import React, { useState } from 'react';
import { Alert, Modal, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import Screen from '../components/Screen';
import AppHeader from '../components/AppHeader';
import Card from '../components/Card';
import TextField from '../components/TextField';
import Button from '../components/Button';
import Icon from '../components/Icon';
import { useBills } from '../context/BillsContext';
import { categoryMeta, money } from '../data/mock';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { BS_WEEKDAYS_EN, BS_WEEKDAYS_NE, bsMonthLabel, getBsMonth, localizeDigits, parseBs, todayBs } from '../utils/nepaliDate';

const categories = ['Electricity', 'Internet', 'Rent', 'Water Bill', 'Garbage Bill', 'Cooking Gas'];

export default function AddBillScreen({ navigation, route }: any) {
  const { addBill, updateBill, removeBill, bills } = useBills();
  const { colors: theme } = useTheme();
  const { t, language } = useLanguage();
  const existing = bills.find((bill) => bill.id === route?.params?.billId);
  const editing = Boolean(existing);

  const [name, setName] = useState(existing?.name || '');
  const [category, setCategory] = useState(existing?.category || 'Electricity');
  const [amount, setAmount] = useState(existing?.amount == null ? '' : String(existing.amount));
  const [date, setDate] = useState(existing?.date || todayBs());
  const [repeat, setRepeat] = useState(existing?.recurring ?? true);
  const [notes, setNotes] = useState(existing?.notes || '');
  const [previous, setPrevious] = useState(String(existing?.previousReading ?? [...bills]
    .filter((bill) => bill.category === 'Electricity' && bill.currentReading != null)
    .sort((a, b) => (b.date > a.date ? 1 : -1))[0]?.currentReading ?? ''));
  const [current, setCurrent] = useState(String(existing?.currentReading ?? ''));
  const [rate, setRate] = useState(String(existing?.rate ?? ''));
  const [showCategories, setShowCategories] = useState(false);
  const initialDate = existing?.date || todayBs();
  const initialParts = initialDate.split('-').map(Number);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calendarYear, setCalendarYear] = useState(initialParts[0]);
  const [calendarMonth, setCalendarMonth] = useState(initialParts[1]);

  const electricity = category === 'Electricity';
  const p = Number(previous);
  const c = Number(current);
  const r = Number(rate);
  const units = current !== '' && previous !== '' ? c - p : 0;
  const calculated = units >= 0 && rate !== '' ? Math.round(units * r * 100) / 100 : null;

  const save = async () => {
    if (!name.trim() || !date) return Alert.alert('Missing details', 'Enter a bill name and date.');
    try { parseBs(date); } catch { return Alert.alert('Check date', 'Enter a valid Nepali date in YYYY-MM-DD format.'); }
    if (electricity && (previous === '' || current === '' || rate === '' || !Number.isFinite(units) || units < 0 || r <= 0)) {
      return Alert.alert('Check readings', 'Current reading must be at least the previous reading and rate must be positive.');
    }
    if (!electricity && (!amount || !Number.isFinite(Number(amount)) || Number(amount) < 0)) {
      return Alert.alert('Check amount', 'Enter a valid amount.');
    }

    const fields: any = {
      name: name.trim(),
      category,
      amount: electricity ? calculated : Number(amount),
      date,
      recurring: repeat,
      notes,
      previousReading: electricity ? p : undefined,
      currentReading: electricity ? c : undefined,
      rate: electricity ? r : undefined,
      units: electricity ? units : undefined,
    };

    try {
      if (editing) await updateBill(existing!.id, fields);
      else await addBill(fields);
      navigation.goBack();
    } catch (error) {
      const firebaseError = error as { code?: string; message?: string };
      const details = [firebaseError.code, firebaseError.message].filter(Boolean).join(': ');
      Alert.alert(
        'Firebase sync failed',
        `The bill is saved on this device, but not confirmed in Firebase.${details ? `\n${details}` : ''}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    }
  };

  const deleteBill = () => Alert.alert('Delete bill?', 'This cannot be undone.', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Delete',
      style: 'destructive',
      onPress: async () => {
        await removeBill(existing!.id);
        navigation.goBack();
      },
    },
  ]);

  const meta = categoryMeta[category] || { icon: 'mdi:file-document-outline', tint: theme.primary };
  const monthInfo = getBsMonth(calendarYear, calendarMonth);
  const calendarCells: (number | null)[] = [
    ...Array(monthInfo.firstWeekday).fill(null),
    ...Array.from({ length: monthInfo.days }, (_, i) => i + 1),
  ];
  const openDatePicker = () => {
    try {
      const selected = parseBs(date);
      setCalendarYear(selected.year);
      setCalendarMonth(selected.month);
    } catch {
      const current = todayBs().split('-').map(Number);
      setCalendarYear(current[0]);
      setCalendarMonth(current[1]);
    }
    setShowDatePicker(true);
  };
  const changeCalendarMonth = (delta: number) => {
    const next = new Date(calendarYear, calendarMonth - 1 + delta, 1);
    setCalendarYear(next.getFullYear());
    setCalendarMonth(next.getMonth() + 1);
  };

  return (
    <Screen transparent style={styles.modalOverlay}>
      <View style={[styles.popup, { backgroundColor: theme.card }]}>
      <AppHeader title={editing ? t('Edit Bill') : t('Add Bill')} onBack={() => navigation.goBack()} center />
      <Card>
        <TextField label={t('Bill Name')} placeholder="e.g. Electricity" value={name} onChangeText={setName} />
        <Text style={[styles.label, { color: theme.text }]}>{t('Category')}</Text>
        <TouchableOpacity
          style={[styles.select, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => setShowCategories(!showCategories)}
        >
          <Icon name={meta.icon} size={18} color={meta.tint} />
          <Text style={{ flex: 1, color: theme.text }}>{category}</Text>
          <Icon name="mdi:chevron-down" size={18} color={theme.muted} />
        </TouchableOpacity>
        {showCategories && (
          <View style={[styles.options, { borderColor: theme.border }]}>
            {categories.map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => {
                  setCategory(item);
                  setShowCategories(false);
                }}
                style={[styles.option, { backgroundColor: theme.card, borderBottomColor: theme.border }]}
              >
                <Text style={{ color: theme.text }}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {electricity ? (
          <>
            <TextField label={t('Previous Reading (kWh)')} placeholder="0" value={previous} onChangeText={setPrevious} keyboardType="decimal-pad" />
            <TextField label={t('Current Reading (kWh)')} placeholder="0" value={current} onChangeText={setCurrent} keyboardType="decimal-pad" />
            <TextField label={t('Rate per Unit')} placeholder="0.00" value={rate} onChangeText={setRate} keyboardType="decimal-pad" />
            <View style={[styles.preview, { backgroundColor: theme.primarySoft }]}>
              <Text style={[styles.previewText, { color: theme.primary }]}>Units: {units >= 0 ? units.toFixed(2) : 'Invalid'}</Text>
              <Text style={[styles.previewText, { color: theme.primary }]}>Amount: {calculated == null ? '—' : money(calculated)}</Text>
            </View>
          </>
        ) : (
          <TextField label={t('Amount')} placeholder="0.00" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
        )}
        <Text style={[styles.label, { color: theme.text }]}>{t('Date')}</Text>
        <TouchableOpacity onPress={openDatePicker} style={[styles.dateField, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Icon name="mdi:calendar-month-outline" size={19} color={theme.primary} />
          <Text style={{ flex: 1, color: theme.text }}>{localizeDigits(date, language)}</Text>
          <Icon name="mdi:chevron-down" size={18} color={theme.muted} />
        </TouchableOpacity>
        <View style={styles.repeat}>
          <Icon name="mdi:calendar-sync-outline" size={20} color={theme.muted} />
          <Text style={{ flex: 1, color: theme.text }}>{t('Repeat Monthly')}</Text>
          <Switch value={repeat} onValueChange={setRepeat} trackColor={{ true: theme.primary }} />
        </View>
        <TextField label={t('Notes (Optional)')} placeholder="Add a note..." value={notes} onChangeText={setNotes} />
      </Card>
      <Button title={editing ? t('Save Changes') : t('Save Bill')} onPress={save} style={{ marginTop: 16 }} />
      {editing && <Button title={t('Delete Bill')} variant="outline" onPress={deleteBill} style={{ marginTop: 10 }} />}
      </View>
      <Modal visible={showDatePicker} transparent animationType="slide" onRequestClose={() => setShowDatePicker(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.datePicker, { backgroundColor: theme.card }]}>
            <View style={styles.datePickerHeader}>
              <Text style={[styles.datePickerTitle, { color: theme.text }]}>{t('Select Date')}</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}><Text style={{ color: theme.primary, fontWeight: '700' }}>{t('Done')}</Text></TouchableOpacity>
            </View>
            <View style={styles.monthNav}>
              <TouchableOpacity onPress={() => changeCalendarMonth(-1)}><Icon name="mdi:chevron-left" size={22} /></TouchableOpacity>
              <Text style={[styles.monthTitle, { color: theme.text }]}>{bsMonthLabel(calendarYear, calendarMonth, language)}</Text>
              <TouchableOpacity onPress={() => changeCalendarMonth(1)}><Icon name="mdi:chevron-right" size={22} /></TouchableOpacity>
            </View>
            <View style={styles.calendarGrid}>
              {(language === 'ne' ? BS_WEEKDAYS_NE : BS_WEEKDAYS_EN).map((day) => <Text key={day} style={[styles.weekday, { color: theme.muted }]}>{day}</Text>)}
              {calendarCells.map((day, index) => {
                const value = day ? `${calendarYear}-${String(calendarMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
                  const selected = value === date;
                return <TouchableOpacity key={index} disabled={!day} onPress={() => { setDate(value); setShowDatePicker(false); }} style={[styles.dateCell, selected && { backgroundColor: theme.primary }]}>
                  {day && <Text style={{ color: selected ? '#fff' : theme.text, fontWeight: selected ? '800' : '400' }}>{localizeDigits(String(day), language)}</Text>}
                </TouchableOpacity>;
              })}
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flexGrow: 1, justifyContent: 'center', backgroundColor: 'rgba(15, 23, 42, 0.55)', paddingVertical: 22 },
  popup: { borderRadius: 22, padding: 4, maxHeight: '94%', overflow: 'hidden' },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  select: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 48, borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, marginBottom: 8 },
  options: { borderWidth: 1, borderRadius: 12, marginBottom: 14, overflow: 'hidden' },
  option: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1 },
  repeat: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  dateField: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 48, borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, marginBottom: 14 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15, 23, 42, 0.45)' },
  datePicker: { borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, paddingBottom: 30 },
  datePickerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  datePickerTitle: { fontSize: 18, fontWeight: '800' },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  monthTitle: { fontSize: 16, fontWeight: '700' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  weekday: { width: '14.28%', textAlign: 'center', fontSize: 11, marginBottom: 8 },
  dateCell: { width: '14.28%', height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  preview: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderRadius: 12, marginBottom: 14 },
  previewText: { fontWeight: '700' },
});
