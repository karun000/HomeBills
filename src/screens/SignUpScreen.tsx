import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Screen from '../components/Screen';
import TextField from '../components/TextField';
import Button from '../components/Button';
import AppHeader from '../components/AppHeader';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';
import { useLanguage } from '../context/LanguageContext';

export default function SignUpScreen({ navigation }: any) {
  const { signUp } = useAuth();
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <Screen>
      <AppHeader title={t('Create account')} onBack={() => navigation.goBack()} center />
      <Text style={styles.sub}>{t('Start tracking your household bills today')}</Text>
      <TextField label={t('Full Name')} icon="mdi:account-outline" placeholder="Alex Johnson" value={name} onChangeText={setName} />
      <TextField label={t('Email')} icon="mdi:email-outline" placeholder="you@email.com" value={email}
        onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextField label={t('Password')} icon="mdi:lock-outline" placeholder="••••••••" value={password}
        onChangeText={setPassword} secureTextEntry />
      <Button title={t('Create Account')} onPress={() => signUp(name, email, password).catch((e) => Alert.alert('Account creation failed', e?.message || 'Please check the form.'))} style={{ marginTop: 8 }} />
      <View style={styles.footer}>
        <Text style={{ color: colors.muted }}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: colors.primary, fontWeight: '700' }}>{t('Sign In')}</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sub: { color: colors.muted, textAlign: 'center', marginBottom: 24 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
});
