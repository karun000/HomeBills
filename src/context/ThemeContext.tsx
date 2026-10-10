import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as FileSystem from 'expo-file-system';
import { colors as light } from '../theme';
export const darkColors = { ...light, bg: '#0F172A', card: '#1E293B', text: '#F8FAFC', muted: '#94A3B8', border: '#334155', primarySoft: '#193B70' };
const file = `${FileSystem.documentDirectory || ''}home-theme.json`;
const Ctx = createContext<{ dark: boolean; colors: typeof light; setDark: (v: boolean) => void }>({ dark: false, colors: light, setDark: () => {} });
export const useTheme = () => useContext(Ctx);
export function ThemeProvider({ children }: { children: ReactNode }) { const [dark, setDarkState] = useState(false); useEffect(() => { FileSystem.readAsStringAsync(file).then(v => setDarkState(JSON.parse(v).dark)).catch(() => {}); }, []); const setDark = (v: boolean) => { setDarkState(v); FileSystem.writeAsStringAsync(file, JSON.stringify({ dark: v })).catch(() => {}); }; return <Ctx.Provider value={{ dark, colors: dark ? darkColors : light, setDark }}>{children}</Ctx.Provider>; }
