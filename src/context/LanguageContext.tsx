import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as FileSystem from 'expo-file-system';

export type Language = 'en' | 'ne';
type LanguageContextValue = { language: Language; setLanguage: (language: Language) => void; t: (key: string) => string };
const LanguageContext = createContext<LanguageContextValue>({ language: 'en', setLanguage: () => {}, t: (key) => key });
const file = `${FileSystem.documentDirectory || ''}home-language.json`;

const translations: Record<Language, Record<string, string>> = {
  en: {},
  ne: {
    Home: 'गृह', Bills: 'बिलहरू', Insights: 'विश्लेषण', Calendar: 'पात्रो', More: 'थप', Settings: 'सेटिङहरू',
    'Monthly Summary': 'मासिक सारांश', 'Total Unpaid': 'तिर्न बाँकी जम्मा', Paid: 'तिरेको', Unpaid: 'तिर्न बाँकी',
    'Unpaid Bills': 'तिर्न बाँकी बिलहरू', 'Recorded Bills': 'रेकर्ड गरिएका बिलहरू', 'View All': 'सबै हेर्नुहोस्', 'Quick Actions': 'छरितो कार्यहरू', 'Add Bill': 'बिल थप्नुहोस्', 'View Calendar': 'पात्रो हेर्नुहोस्', 'See Insights': 'विश्लेषण हेर्नुहोस्',
    All: 'सबै', 'Awaiting Reading': 'रिडिङ बाँकी', Cancel: 'रद्द गर्नुहोस्', selected: 'छानिएको', 'Search bills...': 'बिल खोज्नुहोस्...',
    'No bills recorded this BS month.': 'यो BS महिनामा कुनै बिल रेकर्ड गरिएको छैन।',
    'Total Spent': 'जम्मा खर्च', 'Spending by Category': 'श्रेणीअनुसार खर्च', 'vs last month': 'गत महिनासँग तुलना', 'compared to last month!': 'गत महिनासँग तुलना!',
    Notifications: 'सूचनाहरू', 'Bill reminders and alerts': 'बिल सम्झना र चेतावनी', 'Recurring Reminders': 'दोहोरिने सम्झना', 'Manage reminder preferences': 'सम्झना प्राथमिकता व्यवस्थापन',
    'Payment Categories': 'भुक्तानी श्रेणी', 'Customize your bill categories': 'बिल श्रेणी परिवर्तन गर्नुहोस्', Currency: 'मुद्रा', 'Dark Mode': 'डार्क मोड', 'Backup & Sync': 'ब्याकअप र सिङ्क',
    'Keep your data safe': 'तपाईंको डाटा सुरक्षित राख्नुहोस्', 'Help & Support': 'सहायता र समर्थन', 'Privacy Policy': 'गोपनीयता नीति', 'About Home Bills': 'Home Bills बारे', 'Sign Out': 'साइन आउट',
    'Cloud sync unavailable. Bills are saved on this device.': 'क्लाउड सिङ्क उपलब्ध छैन। बिलहरू यस उपकरणमा सुरक्षित छन्।',
    'Edit Bill': 'बिल सम्पादन', 'Save Bill': 'बिल सुरक्षित गर्नुहोस्', 'Save Changes': 'परिवर्तन सुरक्षित गर्नुहोस्', 'Delete Bill': 'बिल मेटाउनुहोस्',
    'Bill Name': 'बिलको नाम', Category: 'श्रेणी', Date: 'मिति', 'Select Date': 'मिति छान्नुहोस्', 'Paid on': 'भुक्तानी मिति', Done: 'सम्पन्न', 'Repeat Monthly': 'मासिक दोहोर्याउनुहोस्', 'Notes (Optional)': 'टिप्पणी (ऐच्छिक)',
    'Previous Reading (kWh)': 'अघिल्लो रिडिङ (kWh)', 'Current Reading (kWh)': 'हालको रिडिङ (kWh)', 'Rate per Unit': 'प्रति युनिट दर', Amount: 'रकम',
    'Welcome back': 'फेरि स्वागत छ', 'Manage household bills with clarity and ease': 'घरायसी बिल सजिलै व्यवस्थापन गर्नुहोस्', Email: 'इमेल', Password: 'पासवर्ड', 'Sign In': 'साइन इन', 'Sign Up': 'साइन अप',
    'Create account': 'खाता बनाउनुहोस्', 'Start tracking your household bills today': 'आजै घरायसी बिल ट्र्याक गर्न सुरु गर्नुहोस्', 'Full Name': 'पूरा नाम', 'Create Account': 'खाता बनाउनुहोस्',
  },
};

export const useLanguage = () => useContext(LanguageContext);
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  useEffect(() => { FileSystem.readAsStringAsync(file).then((value) => { const parsed = JSON.parse(value); if (parsed.language === 'en' || parsed.language === 'ne') setLanguageState(parsed.language); }).catch(() => {}); }, []);
  const setLanguage = (next: Language) => { setLanguageState(next); FileSystem.writeAsStringAsync(file, JSON.stringify({ language: next })).catch(() => {}); };
  const t = (key: string) => translations[language][key] || key;
  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
}
