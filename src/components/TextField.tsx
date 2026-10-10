import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import Icon from './Icon';
import { colors } from '../theme';
import { useTheme } from '../context/ThemeContext';

type Props = TextInputProps & { label?: string; icon?: string };

export default function TextField({ label, icon, style, ...rest }: Props) {
  const { colors: theme } = useTheme();
  return (
    <View style={{ marginBottom: 14 }}>
      {label && <Text style={[styles.label, { color: theme.text }]}>{label}</Text>}
      <View style={[styles.box, { backgroundColor: theme.card, borderColor: theme.border }]}>
        {icon && <Icon name={icon} size={18} color={colors.muted} />}
        <TextInput placeholderTextColor={theme.muted} style={[styles.input, { color: theme.text }, style]} {...rest} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 6 },
  box: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F1F5FB',
    borderRadius: 12, paddingHorizontal: 12, height: 48, borderWidth: 1, borderColor: colors.border,
  },
  input: { flex: 1, fontSize: 14, color: colors.text },
});
