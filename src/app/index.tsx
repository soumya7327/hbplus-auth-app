import { router } from 'expo-router';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';

import { hasAllowedEmailDomain, useAuth } from '@/contexts/auth-context';

type LoginMode = 'signIn' | 'forgotPassword';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function WellnessMark({ inverted = false }: { inverted?: boolean }) {
  return (
    <View style={[styles.brandMark, inverted && styles.brandMarkInverted]}>
      <View style={styles.markLeafTop} />
      <View style={styles.markLeafLeft} />
      <View style={styles.markLeafRight} />
      <View style={styles.markStem} />
    </View>
  );
}

function WellnessHero({ desktop }: { desktop: boolean }) {
  return (
    <View style={[styles.hero, desktop ? styles.heroDesktop : styles.heroMobile]}>
      <Image
        accessibilityLabel="Illustrated wellness landscape with a person stretching at sunrise"
        contentFit="cover"
        source={require('@/assets/images/wellness-hero.svg')}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.heroScrim} />
      <View style={[styles.heroContent, desktop ? styles.heroContentDesktop : styles.heroContentMobile]}>
        <View style={styles.brandRow}>
          <WellnessMark inverted />
          <View>
            <Text style={styles.brandName}>HB<Text style={styles.brandPlus}>+</Text></Text>
            <Text style={styles.brandTagline}>WELLNESS, MADE PERSONAL</Text>
          </View>
        </View>

        <View style={styles.heroMessage}>
          <View style={styles.heroKicker}>
            <View style={styles.heroKickerDot} />
            <Text style={styles.heroKickerText}>A HEALTHIER YOU STARTS HERE</Text>
          </View>
          <Text style={styles.heroTitle}>
            Move better,{'\n'}live <Text style={styles.heroTitleAccent}>brighter.</Text>
          </Text>
          <Text style={styles.heroDescription}>
            Small steps. Stronger habits.{'\n'}A more vibrant you, every day.
          </Text>

          {desktop ? (
            <View style={styles.benefitList}>
              <View style={styles.benefit}>
                <Text style={styles.benefitIcon}>01</Text>
                <Text style={styles.benefitText}>Build healthy habits</Text>
              </View>
              <View style={styles.benefit}>
                <Text style={styles.benefitIcon}>02</Text>
                <Text style={styles.benefitText}>Celebrate your progress</Text>
              </View>
              <View style={styles.benefit}>
                <Text style={styles.benefitIcon}>03</Text>
                <Text style={styles.benefitText}>Feel better, every day</Text>
              </View>
            </View>
          ) : null}
        </View>

        {desktop ? (
          <View style={styles.heroQuote}>
            <Text style={styles.quoteMark}>“</Text>
            <Text style={styles.quoteText}>A healthier you builds a brighter tomorrow.</Text>
          </View>
        ) : (
          <Text style={styles.mobileHeroFooter}>MOVE WITH PURPOSE · GROW AT YOUR PACE</Text>
        )}
      </View>
    </View>
  );
}

export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const desktop = width >= 940;
  const {
    user,
    loading,
    authLoading,
    error,
    notice,
    signInWithGoogle,
    signInWithEmailPassword,
    sendPasswordReset,
  } = useAuth();
  const [mode, setMode] = useState<LoginMode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.replace('./dashboard');
    }
  }, [loading, user]);

  function changeMode(nextMode: LoginMode) {
    setMode(nextMode);
    setFormError(null);
  }

  async function submitEmailForm() {
    setFormError(null);
    const trimmedEmail = email.trim();
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setFormError('Enter a valid email address.');
      return;
    }
    if (!hasAllowedEmailDomain(trimmedEmail)) {
      setFormError(
        'Access restricted. Use a verified @hbplus.fit account or the configured local test account.',
      );
      return;
    }
    if (mode !== 'forgotPassword' && password.length === 0) {
      setFormError('Enter your password.');
      return;
    }

    if (mode === 'forgotPassword') {
      await sendPasswordReset(trimmedEmail);
    } else {
      await signInWithEmailPassword(trimmedEmail, password);
    }
  }

  if (authLoading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <WellnessMark />
        <ActivityIndicator color="#187967" size="small" style={styles.loadingIndicator} />
        <Text style={styles.loadingText}>Restoring your secure session…</Text>
      </SafeAreaView>
    );
  }

  const pageContent = (
    <>
      <WellnessHero desktop={desktop} />
      <View style={[styles.formPanel, desktop ? styles.formPanelDesktop : styles.formPanelMobile]}>
        <View style={styles.formContent}>
          <Text style={styles.formEyebrow}>YOUR WELLNESS SPACE</Text>
          <Text style={styles.formTitle}>
            {mode === 'forgotPassword' ? 'Reset password' : 'Welcome back'}
          </Text>
          <Text style={styles.formSubtitle}>
            {mode === 'forgotPassword'
              ? 'Enter your @hbplus.fit email and we’ll send a reset link.'
              : 'Sign in to continue your health and fitness journey.'}
          </Text>

          <View style={styles.methodRow}>
            <View style={styles.methodSelected}>
              <Text style={styles.methodSelectedText}>Email & password</Text>
            </View>
            <Text style={styles.methodHint}>Google available below</Text>
          </View>

          <Text style={styles.fieldLabel}>Email address</Text>
          <View style={styles.inputWrap}>
            <Text style={styles.inputGlyph}>@</Text>
            <TextInput
              accessibilityLabel="Email address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              editable={!loading}
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#98A49F"
              returnKeyType="next"
              style={styles.input}
              textContentType="emailAddress"
              value={email}
            />
          </View>

          {mode !== 'forgotPassword' ? (
            <>
              <View style={styles.passwordLabelRow}>
                <Text style={styles.fieldLabel}>Password</Text>
                {mode === 'signIn' ? (
                  <Pressable
                    accessibilityRole="button"
                    disabled={loading}
                    onPress={() => changeMode('forgotPassword')}>
                    <Text style={styles.forgotLink}>Forgot password?</Text>
                  </Pressable>
                ) : null}
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.lockGlyph}>•</Text>
                <TextInput
                  accessibilityLabel="Password"
                  autoCapitalize="none"
                  autoComplete="current-password"
                  editable={!loading}
                  onChangeText={setPassword}
                  onSubmitEditing={() => void submitEmailForm()}
                  placeholder="Enter your password"
                  placeholderTextColor="#98A49F"
                  returnKeyType="go"
                  secureTextEntry={!passwordVisible}
                  style={styles.input}
                  textContentType="password"
                  value={password}
                />
                <Pressable
                  accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'}
                  accessibilityRole="button"
                  disabled={loading}
                  hitSlop={10}
                  onPress={() => setPasswordVisible((visible) => !visible)}
                  style={styles.showPasswordButton}>
                  <Text style={styles.showPasswordText}>{passwordVisible ? 'Hide' : 'Show'}</Text>
                </Pressable>
              </View>
            </>
          ) : null}

          {formError || error ? (
            <View accessibilityRole="alert" style={styles.messageError}>
              <Text style={styles.messageErrorText}>{formError ?? error}</Text>
            </View>
          ) : null}
          {notice ? (
            <View accessibilityRole="alert" style={styles.messageSuccess}>
              <Text style={styles.messageSuccessText}>{notice}</Text>
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: loading }}
            disabled={loading}
            onPress={() => void submitEmailForm()}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && !loading ? styles.buttonPressed : null,
              loading ? styles.buttonDisabled : null,
            ]}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {mode === 'forgotPassword' ? 'Send reset link' : 'Sign in'}
              </Text>
            )}
          </Pressable>

          {mode === 'forgotPassword' ? (
            <Pressable
              accessibilityRole="button"
              disabled={loading}
              onPress={() => changeMode('signIn')}
              style={styles.backToSignIn}>
              <Text style={styles.backToSignInText}>Back to sign in</Text>
            </Pressable>
          ) : (
            <>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: loading }}
                disabled={loading}
                onPress={() => void signInWithGoogle()}
                style={({ pressed }) => [
                  styles.googleButton,
                  pressed && !loading ? styles.googleButtonPressed : null,
                  loading ? styles.buttonDisabled : null,
                ]}>
                {loading ? (
                  <ActivityIndicator color="#166B5A" />
                ) : (
                  <>
                    <View style={styles.googleBadge}>
                      <Text style={styles.googleLetter}>G</Text>
                    </View>
                    <Text style={styles.googleButtonText}>Continue with Google</Text>
                  </>
                )}
              </Pressable>
              <Text style={styles.googleCaption}>Use your authorized HB+ Google account</Text>
            </>
          )}

          <View style={styles.policyNote}>
            <WellnessMark />
            <Text style={styles.policyText}>
              Access requires a verified @hbplus.fit account. A configured local test account is
              accepted in development only.
            </Text>
          </View>
        </View>

        <Text style={styles.panelFooter}>HB+ · WELLNESS FOR EVERY DAY</Text>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {desktop ? (
        <View style={styles.desktopLayout}>{pageContent}</View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.mobileLayout}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {pageContent}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8F5',
  },
  desktopLayout: {
    flex: 1,
    flexDirection: 'row',
    minHeight: '100%',
  },
  mobileLayout: {
    flexGrow: 1,
  },
  hero: {
    backgroundColor: '#173F36',
    overflow: 'hidden',
  },
  heroDesktop: {
    width: '46%',
    minHeight: '100%',
  },
  heroMobile: {
    minHeight: 350,
  },
  heroScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(13, 43, 36, 0.48)',
  },
  heroContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  heroContentDesktop: {
    paddingHorizontal: 56,
    paddingTop: 50,
    paddingBottom: 42,
  },
  heroContentMobile: {
    paddingHorizontal: 24,
    paddingTop: 26,
    paddingBottom: 24,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  brandMark: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: '#E5F2EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  brandMarkInverted: {
    width: 48,
    height: 48,
    borderRadius: 17,
    backgroundColor: 'rgba(245, 250, 244, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  markLeafTop: {
    position: 'absolute',
    width: 11,
    height: 17,
    borderWidth: 2,
    borderColor: '#176F5E',
    borderRadius: 10,
    top: 8,
  },
  markLeafLeft: {
    position: 'absolute',
    width: 10,
    height: 15,
    borderWidth: 2,
    borderColor: '#176F5E',
    borderRadius: 10,
    left: 9,
    top: 13,
    transform: [{ rotate: '-40deg' }],
  },
  markLeafRight: {
    position: 'absolute',
    width: 10,
    height: 15,
    borderWidth: 2,
    borderColor: '#176F5E',
    borderRadius: 10,
    right: 9,
    top: 13,
    transform: [{ rotate: '40deg' }],
  },
  markStem: {
    position: 'absolute',
    width: 2,
    height: 10,
    backgroundColor: '#176F5E',
    top: 21,
  },
  brandName: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  brandPlus: {
    color: '#9AD7B2',
  },
  brandTagline: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 9,
    letterSpacing: 1.15,
    marginTop: 3,
  },
  heroMessage: {
    marginTop: 34,
    marginBottom: 30,
  },
  heroKicker: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  heroKickerDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#9AD7B2',
    marginRight: 9,
  },
  heroKickerText: {
    color: '#E1F0E4',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 50,
    fontWeight: '700',
    letterSpacing: -1.7,
    lineHeight: 56,
  },
  heroTitleAccent: {
    color: '#A9DEBA',
  },
  heroDescription: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 18,
  },
  benefitList: {
    gap: 13,
    marginTop: 28,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitIcon: {
    width: 30,
    height: 30,
    lineHeight: 30,
    textAlign: 'center',
    color: '#E0F2E5',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 10,
    fontSize: 9,
    fontWeight: '700',
    marginRight: 12,
  },
  benefitText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
  heroQuote: {
    maxWidth: 330,
    borderLeftWidth: 2,
    borderLeftColor: '#A9DEBA',
    paddingLeft: 16,
  },
  quoteMark: {
    color: '#A9DEBA',
    fontSize: 25,
    lineHeight: 25,
  },
  quoteText: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 20,
  },
  mobileHeroFooter: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  formPanel: {
    flex: 1,
    backgroundColor: '#FCFCFA',
  },
  formPanelDesktop: {
    paddingHorizontal: 42,
    paddingTop: 32,
    paddingBottom: 24,
  },
  formPanelMobile: {
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 24,
  },
  formContent: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 30,
  },
  formEyebrow: {
    color: '#16816D',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.35,
    marginBottom: 10,
  },
  formTitle: {
    color: '#172B27',
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.9,
    lineHeight: 41,
  },
  formSubtitle: {
    color: '#78847E',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 21,
  },
  methodRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F1F5F0',
    borderRadius: 12,
    paddingHorizontal: 13,
    marginBottom: 20,
  },
  methodSelected: {
    backgroundColor: '#E1F1E8',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  methodSelectedText: {
    color: '#176C59',
    fontSize: 11,
    fontWeight: '700',
  },
  methodHint: {
    color: '#89948D',
    fontSize: 10,
  },
  fieldLabel: {
    color: '#293A34',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrap: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#DFE6E0',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    marginBottom: 17,
  },
  inputGlyph: {
    width: 20,
    color: '#71867C',
    fontSize: 15,
    fontWeight: '600',
    marginRight: 8,
  },
  lockGlyph: {
    width: 20,
    color: '#71867C',
    fontSize: 19,
    marginRight: 8,
  },
  input: {
    flex: 1,
    minWidth: 0,
    color: '#24352F',
    fontSize: 14,
    paddingVertical: 12,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  forgotLink: {
    color: '#157A66',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
  },
  showPasswordButton: {
    paddingVertical: 8,
    paddingLeft: 10,
  },
  showPasswordText: {
    color: '#157A66',
    fontSize: 11,
    fontWeight: '600',
  },
  messageError: {
    borderColor: '#F0CCC5',
    borderWidth: 1,
    backgroundColor: '#FFF5F2',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 13,
  },
  messageErrorText: {
    color: '#9A4034',
    fontSize: 12,
    lineHeight: 18,
  },
  messageSuccess: {
    borderColor: '#CAE5D3',
    borderWidth: 1,
    backgroundColor: '#EFF8F1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 13,
  },
  messageSuccessText: {
    color: '#276B4E',
    fontSize: 12,
    lineHeight: 18,
  },
  primaryButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#176F5D',
    borderRadius: 12,
    marginTop: 2,
    shadowColor: '#176F5D',
    shadowOpacity: 0.17,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    marginVertical: 20,
  },
  dividerLine: {
    height: 1,
    flex: 1,
    backgroundColor: '#E5E9E4',
  },
  dividerText: {
    color: '#98A29D',
    fontSize: 10,
    fontWeight: '600',
  },
  googleButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#DDE5DF',
    borderWidth: 1,
    borderRadius: 12,
  },
  googleButtonPressed: {
    backgroundColor: '#F6FAF6',
  },
  googleBadge: {
    width: 23,
    height: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6F8F7',
    borderRadius: 12,
    marginRight: 10,
  },
  googleLetter: {
    color: '#4285F4',
    fontSize: 14,
    fontWeight: '700',
  },
  googleButtonText: {
    color: '#273831',
    fontSize: 13,
    fontWeight: '600',
  },
  googleCaption: {
    color: '#89948D',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 8,
  },
  backToSignIn: {
    alignSelf: 'center',
    paddingVertical: 13,
  },
  backToSignInText: {
    color: '#157A66',
    fontSize: 12,
    fontWeight: '600',
  },
  policyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF7F1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 20,
  },
  policyText: {
    flex: 1,
    color: '#527365',
    fontSize: 10,
    lineHeight: 15,
  },
  panelFooter: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    color: '#A4ADA6',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1,
    textAlign: 'center',
  },
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F8F5',
  },
  loadingIndicator: {
    marginTop: 22,
    marginBottom: 10,
  },
  loadingText: {
    color: '#718078',
    fontSize: 13,
  },
});
