import React, { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { useTheme } from '../context/ThemeContext';

type Props = { children: ReactNode; scroll?: boolean; style?: ViewStyle; transparent?: boolean };

export default function Screen({ children, scroll = true, style, transparent = false }: Props) {
  const theme = useTheme();
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: transparent ? 'transparent' : theme.colors.bg }]} edges={['top']}>
      {scroll ? (
        <ScrollView contentContainerStyle={[styles.content, style]} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, { flex: 1 }, style]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 18, paddingBottom: 30 },
});
