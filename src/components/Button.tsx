import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import Icon from './Icon';
import { colors } from '../theme';
import { useTheme } from '../context/ThemeContext';

type Props = { title: string; onPress: () => void; icon?: string; variant?: 'primary' | 'outline'; style?: ViewStyle };

export default function Button({ title, onPress, icon, variant = 'primary', style }: Props) {
  const { colors: theme } = useTheme();
  const outline = variant === 'outline';
  const fg = outline ? theme.primary : '#fff';
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.btn, outline ? { borderWidth: 1.5, borderColor: theme.primary, backgroundColor: 'transparent' } : { backgroundColor: theme.primary }, style]}
    >
      {icon && <Icon name={icon} size={18} color={fg} />}
      <Text style={[styles.text, { color: fg }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { flexDirection: 'row', gap: 6, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  outline: { borderWidth: 1.5, borderColor: colors.primary, backgroundColor: 'transparent' },
  text: { fontWeight: '700', fontSize: 15 },
});
