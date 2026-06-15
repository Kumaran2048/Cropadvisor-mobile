import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  FlatList,
  SafeAreaView
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { SUPPORTED_REGIONS } from '../utils/constants';
import { COLORS, commonStyles } from '../utils/styles';

export default function Register({ navigation }: any) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    role: 'farmer', district: '', state: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Selector Modal state
  const [pickerType, setPickerType] = useState<'state' | 'district' | null>(null);

  const states = Object.keys(SUPPORTED_REGIONS);
  const districts = form.state ? SUPPORTED_REGIONS[form.state] : [];

  const handleSelect = (field: 'state' | 'district', value: string) => {
    if (field === 'state') {
      setForm({ ...form, state: value, district: '' });
    } else {
      setForm({ ...form, district: value });
    }
    setPickerType(null);
  };

  const submit = async () => {
    if (!form.state || !form.district) {
      setError('Please select a supported state and district.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigation.replace('MainLayout');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back to Login</Text>
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>🌿</Text>
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the smart farming revolution today.</Text>
        </View>

        {/* Form Section */}
        <View style={[styles.card, commonStyles.shadow]}>
          {error ? (
            <View style={styles.errorBanner}>
              <View style={styles.errorDot} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <View style={styles.rowInputs}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>FULL NAME</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your Name"
                  placeholderTextColor={COLORS.textMutedLight}
                  value={form.name}
                  onChangeText={(val) => setForm({ ...form, name: val })}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>PHONE</Text>
                <TextInput
                  style={styles.input}
                  placeholder="10 Digits"
                  placeholderTextColor={COLORS.textMutedLight}
                  keyboardType="phone-pad"
                  value={form.phone}
                  onChangeText={(val) => setForm({ ...form, phone: val })}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.input}
                placeholder="farmer@example.com"
                placeholderTextColor={COLORS.textMutedLight}
                keyboardType="email-address"
                autoCapitalize="none"
                value={form.email}
                onChangeText={(val) => setForm({ ...form, email: val })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>SECURE PASSWORD</Text>
              <TextInput
                style={styles.input}
                placeholder="Min 6 characters"
                placeholderTextColor={COLORS.textMutedLight}
                secureTextEntry
                autoCapitalize="none"
                value={form.password}
                onChangeText={(val) => setForm({ ...form, password: val })}
              />
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>SELECT STATE</Text>
                <TouchableOpacity
                  style={styles.selectorButton}
                  onPress={() => setPickerType('state')}
                >
                  <Text style={[styles.selectorButtonText, !form.state && { color: COLORS.textMutedLight }]}>
                    {form.state || 'Choose...'}
                  </Text>
                  <Text style={styles.selectorArrow}>▼</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>DISTRICT</Text>
                <TouchableOpacity
                  style={[styles.selectorButton, !form.state && styles.selectorButtonDisabled]}
                  disabled={!form.state}
                  onPress={() => setPickerType('district')}
                >
                  <Text style={[styles.selectorButtonText, !form.district && { color: COLORS.textMutedLight }]}>
                    {form.district || 'Choose...'}
                  </Text>
                  <Text style={styles.selectorArrow}>▼</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              disabled={loading}
              onPress={submit}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Get Started →</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
            <Text style={styles.loginLinkText}>
              Already a member? <Text style={styles.loginLinkBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Selector Modal */}
      <Modal visible={pickerType !== null} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Select {pickerType === 'state' ? 'State' : 'District'}
            </Text>
            
            <FlatList
              data={pickerType === 'state' ? states : districts}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelect(pickerType!, item)}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
              style={styles.modalList}
            />

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setPickerType(null)}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: COLORS.farmer,
    paddingTop: 30,
    paddingBottom: 50,
    paddingHorizontal: 20,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  logoContainer: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logoText: {
    fontSize: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 6,
  },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    padding: 24,
    marginTop: -30,
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
    borderWidth: 1,
    padding: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  errorDot: {
    width: 8,
    height: 8,
    backgroundColor: '#EF4444',
    borderRadius: 4,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  form: {
    gap: 16,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  formGroup: {
    gap: 6,
  },
  label: {
    fontSize: 9,
    fontWeight: '900',
    color: '#9ca3af',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 14,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  selectorButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorButtonDisabled: {
    opacity: 0.5,
  },
  selectorButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  selectorArrow: {
    fontSize: 9,
    color: '#6b7280',
  },
  submitButton: {
    backgroundColor: COLORS.farmer,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.farmer,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 4,
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  loginLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 13,
    color: COLORS.textMutedLight,
    fontWeight: '600',
  },
  loginLinkBold: {
    color: COLORS.farmer,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxHeight: '70%',
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textLight,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalList: {
    marginBottom: 16,
  },
  modalItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  modalCloseButton: {
    padding: 14,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontWeight: '700',
    color: COLORS.textMutedLight,
  },
});
