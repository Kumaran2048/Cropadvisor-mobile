import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  SafeAreaView
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, commonStyles } from '../utils/styles';

export default function Login({ navigation }: any) {
  const { login, user, sendOTP, loginWithOTP } = useAuth();
  
  const [form, setForm] = useState({ email: 'farmer@demo.com', password: 'password' });
  const [role, setRole] = useState<'farmer' | 'officer' | 'admin'>('farmer');
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  // OTP state
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigation.replace('MainLayout');
    }
  }, [user]);

  const handleSendOTP = async () => {
    if (!phoneOrEmail) {
      setError('Please enter your registered mobile number');
      return;
    }
    setError('');
    setInfoMsg('Sending verification code to your mobile...');
    setOtpSent(true);
    setCountdown(60);
    setLoading(true);
    try {
      await sendOTP(phoneOrEmail);
      setInfoMsg('Verification OTP code sent to your registered mobile number.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP. Make sure the mobile number is registered.');
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    setError('');
    setInfoMsg('');
    
    if (loginMode === 'otp' && !otpSent) {
      await handleSendOTP();
      return;
    }

    setLoading(true);
    try {
      let loggedUser;
      if (loginMode === 'otp') {
        if (!otp) {
          setError('Please enter the 6-digit OTP');
          setLoading(false);
          return;
        }
        loggedUser = await loginWithOTP(phoneOrEmail, otp);
      } else {
        loggedUser = await login(form.email, form.password);
      }
      navigation.replace('MainLayout');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Sign in failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoRole = (selectedRole: 'farmer' | 'officer' | 'admin') => {
    setRole(selectedRole);
    setError('');
    setInfoMsg('');
    setOtpSent(false);
    setLoginMode('password');
    const demoEmails = { farmer: 'farmer@demo.com', officer: 'officer@demo.com', admin: 'admin@demo.com' };
    setForm({ email: demoEmails[selectedRole], password: 'password' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Banner */}
        <View style={styles.header}>
          <Text style={styles.logoEmoji}>🌿</Text>
          <Text style={styles.logoTitle}>CropAdvisor</Text>
          <Text style={styles.logoSubtitle}>Smart farming for every field</Text>
          
          <View style={styles.tagsContainer}>
            {['Disease AI', 'Market AI', 'Smart Advice', 'Real-Time Alerts'].map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Main card */}
        <View style={[styles.card, commonStyles.shadow]}>
          <Text style={styles.cardTitle}>Sign In</Text>

          {/* Role tabs */}
          <View style={styles.roleTabs}>
            {(['farmer', 'officer', 'admin'] as const).map(r => (
              <TouchableOpacity
                key={r}
                style={[styles.roleTab, role === r && styles.roleTabActive]}
                onPress={() => setDemoRole(r)}
              >
                <Text style={[styles.roleTabText, role === r && styles.roleTabTextActive]}>
                  {r === 'farmer' ? 'Farmer' : r === 'officer' ? 'Officer' : 'Admin'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Dynamic Mode Selector (ONLY for farmers) */}
          {role === 'farmer' && (
            <View style={styles.modeTabs}>
              <TouchableOpacity
                style={[styles.modeTab, loginMode === 'password' && styles.modeTabActive]}
                onPress={() => { setLoginMode('password'); setError(''); setInfoMsg(''); }}
              >
                <Text style={[styles.modeTabText, loginMode === 'password' && styles.modeTabTextActive]}>
                  🔑 Password
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeTab, loginMode === 'otp' && styles.modeTabActive]}
                onPress={() => { setLoginMode('otp'); setError(''); setInfoMsg(''); }}
              >
                <Text style={[styles.modeTabText, loginMode === 'otp' && styles.modeTabTextActive]}>
                  📲 Mobile OTP
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Alert & Message Display */}
          {error ? (
            <View style={[styles.alertBanner, { backgroundColor: '#FFF3F0', borderColor: '#fee2e2' }]}>
              <View style={[styles.alertDot, { backgroundColor: '#dc2626' }]} />
              <Text style={[styles.alertText, { color: '#dc2626' }]}>{error}</Text>
            </View>
          ) : null}

          {infoMsg ? (
            <View style={[styles.alertBanner, { backgroundColor: '#ecfdf5', borderColor: '#d1fae5' }]}>
              <View style={[styles.alertDot, { backgroundColor: '#059669' }]} />
              <Text style={[styles.alertText, { color: '#059669' }]}>{infoMsg}</Text>
            </View>
          ) : null}

          {/* Login Form */}
          {loginMode === 'password' ? (
            <View style={styles.form}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>EMAIL ADDRESS</Text>
                <TextInput
                  style={styles.input}
                  placeholder="name@email.com"
                  placeholderTextColor={COLORS.textMutedLight}
                  value={form.email}
                  onChangeText={(val) => setForm({ ...form, email: val })}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>PASSWORD</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textMutedLight}
                  secureTextEntry
                  value={form.password}
                  onChangeText={(val) => setForm({ ...form, password: val })}
                  autoCapitalize="none"
                />
              </View>
            </View>
          ) : (
            <View style={styles.form}>
              <View style={styles.formGroup}>
                <View style={styles.row}>
                  <Text style={styles.label}>REGISTERED MOBILE NUMBER</Text>
                  {otpSent && (
                    <TouchableOpacity onPress={() => { setOtpSent(false); setOtp(''); setError(''); setInfoMsg(''); }}>
                      <Text style={styles.changeNumberBtn}>✏️ Edit</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <TextInput
                  style={[styles.input, otpSent && styles.inputDisabled]}
                  placeholder="e.g. 9876543210"
                  placeholderTextColor={COLORS.textMutedLight}
                  keyboardType="number-pad"
                  value={phoneOrEmail}
                  onChangeText={(val) => setPhoneOrEmail(val.replace(/\D/g, ''))}
                  editable={!otpSent}
                />
              </View>

              {otpSent && (
                <View style={styles.formGroup}>
                  <Text style={styles.label}>ENTER 6-DIGIT OTP</Text>
                  <TextInput
                    style={styles.otpInput}
                    maxLength={6}
                    placeholder="123456"
                    placeholderTextColor={COLORS.textMutedLight}
                    keyboardType="number-pad"
                    value={otp}
                    onChangeText={(val) => setOtp(val.replace(/\D/g, ''))}
                  />
                  <View style={styles.row}>
                    <Text style={styles.resendInfo}>Didn't receive code?</Text>
                    <TouchableOpacity
                      disabled={countdown > 0 || loading}
                      onPress={handleSendOTP}
                    >
                      <Text style={[styles.resendBtn, countdown > 0 && styles.resendBtnDisabled]}>
                        {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}

          <TouchableOpacity
            style={styles.submitBtn}
            disabled={loading}
            onPress={submit}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>
                {loginMode === 'otp' ? (otpSent ? 'Confirm & Sign In →' : 'Send OTP Code') : 'Sign In Now →'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerLink}>
            <Text style={styles.registerText}>
              Don't have an account? <Text style={styles.registerTextBold}>Register</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: COLORS.farmerDark,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  logoTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  logoSubtitle: {
    color: '#rgba(255,255,255,0.85)',
    fontSize: 14,
    marginTop: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 20,
    justifyContent: 'center',
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  tagText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    marginTop: -20,
    marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    width: '100%',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.farmerDark,
    marginBottom: 16,
  },
  roleTabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray100,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  roleTabActive: {
    backgroundColor: '#fff',
    ...commonStyles.shadow,
  },
  roleTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMutedLight,
  },
  roleTabTextActive: {
    color: COLORS.farmer,
  },
  modeTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  modeTabActive: {
    borderColor: COLORS.farmer,
    backgroundColor: 'rgba(45, 106, 79, 0.08)',
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMutedLight,
  },
  modeTabTextActive: {
    color: COLORS.farmer,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    gap: 8,
  },
  alertDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  alertText: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  form: {
    gap: 16,
    marginBottom: 20,
  },
  formGroup: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9ca3af',
    letterSpacing: 1,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  inputDisabled: {
    backgroundColor: '#f9fafb',
    color: COLORS.textMutedLight,
  },
  otpInput: {
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 8,
    textAlign: 'center',
    color: COLORS.textLight,
  },
  changeNumberBtn: {
    color: COLORS.farmer,
    fontSize: 11,
    fontWeight: '800',
  },
  resendInfo: {
    fontSize: 11,
    color: COLORS.textMutedLight,
  },
  resendBtn: {
    color: COLORS.farmer,
    fontWeight: '700',
    fontSize: 11,
  },
  resendBtnDisabled: {
    color: '#9ca3af',
  },
  submitBtn: {
    backgroundColor: COLORS.farmer,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.farmer,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 4,
    marginTop: 10,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  registerLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  registerText: {
    fontSize: 13,
    color: COLORS.textMutedLight,
    fontWeight: '600',
  },
  registerTextBold: {
    color: COLORS.farmer,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
});
