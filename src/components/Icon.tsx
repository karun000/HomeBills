import React from 'react';
import { Iconify } from 'react-native-iconify';
import { useTheme } from '../context/ThemeContext';

type Props = { name: string; size?: number; color?: string };

/** Single wrapper around Iconify so icon usage stays consistent. Names look like "mdi:home". */
export default function Icon({ name, size = 22, color }: Props) {
  const { colors } = useTheme();
  return <Iconify icon={name} size={size} color={color || colors.text} />;
}
