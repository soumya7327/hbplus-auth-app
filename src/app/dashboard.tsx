import { router } from 'expo-router';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useAuth } from '@/contexts/auth-context';

export default function DashboardScreen() {
  const { user, loading, error, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [loading, user]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>HB+ · INTERNAL</Text>
            <Text style={styles.heading}>Dashboard</Text>
          </View>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Authorized</Text>
          </View>
        </View>

        <View style={styles.welcomeCard}>
          <Text style={styles.cardLabel}>SIGNED IN AS</Text>
          <Text style={styles.email}>{user?.email ?? 'Loading account...'}</Text>
          <Text style={styles.copy}>
            Your account has been verified for HB+ internal access.
          </Text>
        </View>

        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: loading }}
          disabled={loading}
          onPress={() => void signOut()}
          style={({ pressed }) => [styles.signOutButton, pressed && !loading ? styles.pressed : null]}>
          {loading ? (
            <ActivityIndicator color="#174A8B" />
          ) : (
            <Text style={styles.signOutText}>Sign out</Text>
          )}
        </Pressable>

        <Text style={styles.footer}>HB+ IT Intern Assessment</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  eyebrow: {
    color: '#53708F',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginBottom: 6,
  },
  heading: {
    color: '#14233B',
    fontSize: 30,
    fontWeight: '700',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF7F1',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#2B9B73',
    marginRight: 7,
  },
  statusText: {
    color: '#267A5D',
    fontSize: 12,
    fontWeight: '600',
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E7ECF3',
    borderWidth: 1,
    borderRadius: 18,
    padding: 24,
  },
  cardLabel: {
    color: '#7A8BA0',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  email: {
    color: '#14233B',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  copy: {
    color: '#65758B',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 11,
  },
  error: {
    color: '#9C3027',
    fontSize: 13,
    marginTop: 14,
  },
  signOutButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    borderColor: '#C9D5E2',
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 20,
    marginTop: 22,
  },
  signOutText: {
    color: '#174A8B',
    fontSize: 14,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.75,
  },
  footer: {
    color: '#8B99AA',
    fontSize: 12,
    marginTop: 'auto',
    paddingTop: 28,
  },
});
