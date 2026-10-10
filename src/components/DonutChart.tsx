import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { categories } from '../data/mock';
import { colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const SIZE = 150;
const STROKE = 26;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;

export default function DonutChart({ total, data = categories }: { total: string; data?: typeof categories }) {
  const { colors: theme } = useTheme();
  const { t } = useLanguage();
  const totalParts = total.match(/^(\S+)\s+(.+)$/);
  const currency = totalParts?.[1];
  const amount = totalParts?.[2] ?? total;
  let offset = 0;
  return (
    <View style={{ width: SIZE, height: SIZE, alignSelf: 'center' }}>
      <Svg width={SIZE} height={SIZE}>
        <G rotation={-90} origin={`${SIZE / 2}, ${SIZE / 2}`}>
          {data.map((c) => {
            const len = (c.pct / 100) * C;
            const el = (
              <Circle
                key={c.name} cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke={c.color}
                strokeWidth={STROKE} strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset}
              />
            );
            offset += len;
            return el;
          })}
        </G>
      </Svg>
      <View style={styles.center}>
        {currency ? <Text style={[styles.currency, { color: theme.muted }]}>{currency}</Text> : null}
        <Text style={[styles.total, { color: theme.text }]}>{amount}</Text>
        <Text style={[styles.sub, { color: theme.muted }]}>{t('Total Spent')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  currency: { fontWeight: '600', fontSize: 10, color: colors.muted },
  total: { fontWeight: '800', fontSize: 15, color: colors.text },
  sub: { fontSize: 10, color: colors.muted },
});
