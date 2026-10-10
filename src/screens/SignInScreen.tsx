import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Screen from '../components/Screen';
import Icon from '../components/Icon';
import TextField from '../components/TextField';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';
import { useLanguage } from '../context/LanguageContext';

export default function SignInScreen({ navigation }: any) {
  const { signIn } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <Screen style={{ paddingTop: 50 }}>
      <View style={styles.logo}>
        <Icon name="mdi:home-circle" size={64} color={colors.primary} />
      </View>
      <Text style={styles.title}>{t('Welcome back')}</Text>
      <Text style={styles.sub}>{t('Manage household bills with clarity and ease')}</Text>

      <TextField label={t('Email')} icon="mdi:email-outline" placeholder="you@email.com" value={email}
        onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextField label={t('Password')} icon="mdi:lock-outline" placeholder="••••••••" value={password}
        onChangeText={setPassword} secureTextEntry />

      {/* Works with empty fields for now. Swap signIn() internals for Firebase later. */}
      <Button title={t('Sign In')} onPress={() => signIn(email, password).catch((e) => Alert.alert('Sign in failed', e?.message || 'Check your email and password.'))} style={{ marginTop: 8 }} />

      <View style={styles.footer}>
        <Text style={styles.muted}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.link}>{t('Sign Up')}</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logo: { alignSelf: 'center', marginBottom: 18 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, textAlign: 'center' },
  sub: { color: colors.muted, textAlign: 'center', marginTop: 6, marginBottom: 30 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  muted: { color: colors.muted },
  link: { color: colors.primary, fontWeight: '700' },
});
