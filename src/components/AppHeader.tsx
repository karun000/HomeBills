import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from './Icon';
import { colors } from '../theme';
import { useTheme } from '../context/ThemeContext';

type Props = { title: string; showLogo?: boolean; onBack?: () => void; onSettings?: () => void; center?: boolean };

export default function AppHeader({ title, showLogo, onBack, onSettings, center }: Props) {
  const { colors: theme } = useTheme();
  return (
    <View style={styles.row}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.side}>
          <Icon name="mdi:arrow-left" size={24} />
        </TouchableOpacity>
      )}
      {showLogo && <Icon name="mdi:home-circle" size={28} color={colors.primary} />}
      <Text style={[styles.title, { color: theme.text }, center && { textAlign: 'center' }]}>{title}</Text>
      {onSettings ? (
        <TouchableOpacity onPress={onSettings}>
          <Icon name="mdi:cog-outline" size={22} color={colors.muted} />
        </TouchableOpacity>
      ) : (
        onBack && <View style={styles.side} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  side: { width: 28 },
  title: { flex: 1, fontSize: 20, fontWeight: '700', color: colors.text },
});
