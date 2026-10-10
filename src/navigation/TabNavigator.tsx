import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from '../components/Icon';
import DashboardScreen from '../screens/DashboardScreen';
import AllBillsScreen from '../screens/AllBillsScreen';
import InsightsScreen from '../screens/InsightsScreen';
import CalendarScreen from '../screens/CalendarScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const Tab = createBottomTabNavigator();

const tabs = [
  { name: 'Home', component: DashboardScreen, icon: 'mdi:home' },
  { name: 'Bills', component: AllBillsScreen, icon: 'mdi:file-document-outline' },
  { name: 'Insights', component: InsightsScreen, icon: 'mdi:chart-bar' },
  { name: 'Calendar', component: CalendarScreen, icon: 'mdi:calendar-month-outline' },
  { name: 'More', component: SettingsScreen, icon: 'mdi:dots-horizontal' },
];

export default function TabNavigator() {
  const { colors: theme } = useTheme();
  const { t: translate } = useLanguage();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.muted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        tabBarStyle: { height: 64, paddingTop: 6, paddingBottom: 8, borderTopColor: theme.border, backgroundColor: theme.card },
      }}
    >
      {tabs.map((t) => (
        <Tab.Screen
          key={t.name}
          name={t.name}
          component={t.component}
          options={{ tabBarLabel: translate(t.name), tabBarIcon: ({ color }) => <Icon name={t.icon} size={24} color={color} /> }}
        />
      ))}
    </Tab.Navigator>
  );
}
