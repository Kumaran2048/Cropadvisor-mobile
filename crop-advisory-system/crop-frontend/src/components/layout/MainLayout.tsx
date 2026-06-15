import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  SafeAreaView,
  Image,
  Alert,
  Modal
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppData } from '../../contexts/AppDataContext';
import { COLORS, getThemeColors, commonStyles } from '../../utils/styles';

// Simple mock/custom components to replace Recharts/Web components
import { SUPPORTED_REGIONS } from '../../utils/constants';

export default function MainLayout({ navigation }: any) {
  const { user, logout, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const {
    crops,
    expenses,
    prices,
    diseaseReports,
    broadcasts,
    addExpense,
    resolveDisease,
    sendBroadcast,
    replyToBroadcast,
    addOfficer,
    addCrop,
    deleteCrop,
    updateUserStatus,
    deleteUser,
    setActiveCrop,
    farmers,
    officers
  } = useAppData();

  const colors = getThemeColors(theme);

  // Active subpage tab
  const [activeTab, setActiveTab] = useState<string>(
    user?.role === 'farmer' ? 'dashboard' : 'dashboard'
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // States for sub-screens
  const [expenseForm, setExpenseForm] = useState({ category: 'Labor', amount: '', date: new Date().toISOString().split('T')[0], cropId: '' });
  const [newCropForm, setNewCropForm] = useState({ name: '', idealSoil: '', season: 'Kharif', avgYield: '2.5' });
  const [newOfficerForm, setNewOfficerForm] = useState({ name: '', email: '', password: '', district: 'Nashik', state: 'Maharashtra' });
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastType, setBroadcastType] = useState('warning');
  const [replyMsg, setReplyMsg] = useState<{ [key: string]: string }>({});
  const [diseaseInput, setDiseaseInput] = useState({ disease: '', cropName: '', confidence: '95', severity: 'Medium', treatment: '' });

  // Soil Advisor states
  const [soilInput, setSoilInput] = useState({ soilType: 'Loamy', ph: '6.5', moisture: 'Medium' });
  const [soilAdvice, setSoilAdvice] = useState<any>(null);

  // What-If states
  const [whatIfInput, setWhatIfInput] = useState({ cropName: '', landSize: '1.0', cropPrice: '' });
  const [whatIfResult, setWhatIfResult] = useState<any>(null);

  // Profile Form Completer (for new users)
  const hasNoRegion = user && (!user.district || !user.state);
  const [stateVal, setStateVal] = useState('');
  const [districtVal, setDistrictVal] = useState('');
  const [landVal, setLandVal] = useState('1.0');
  const [profileLoading, setProfileLoading] = useState(false);

  if (!user) return null;

  const handleProfileComplete = async () => {
    if (!stateVal || !districtVal) {
      Alert.alert('Error', 'Please select both state and district');
      return;
    }
    setProfileLoading(true);
    try {
      await updateProfile({
        name: user.name,
        phone: user.phone || '',
        state: stateVal,
        district: districtVal,
        landSize: Number(landVal)
      });
      Alert.alert('Success', 'Profile setup completed successfully!');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  if (hasNoRegion) {
    return (
      <SafeAreaView style={[styles.profileCompleteContainer, { backgroundColor: colors.bg }]}>
        <ScrollView contentContainerStyle={styles.profileCompleteContent}>
          <Text style={styles.profileCompleteEmoji}>🌱</Text>
          <Text style={[styles.profileCompleteTitle, { color: colors.text }]}>Welcome, {user.name}!</Text>
          <Text style={[styles.profileCompleteText, { color: colors.textMuted }]}>
            To provide accurate local crop advice, weather alerts, and market prices, please set up your farming location.
          </Text>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>SELECT STATE</Text>
            <ScrollView horizontal style={{ maxHeight: 50 }} showsHorizontalScrollIndicator={false}>
              {Object.keys(SUPPORTED_REGIONS).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.smallTabBtn, stateVal === s && styles.smallTabBtnActive]}
                  onPress={() => { setStateVal(s); setDistrictVal(''); }}
                >
                  <Text style={[styles.smallTabBtnText, stateVal === s && styles.smallTabBtnTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {stateVal ? (
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.textMuted }]}>SELECT DISTRICT</Text>
              <ScrollView horizontal style={{ maxHeight: 50 }} showsHorizontalScrollIndicator={false}>
                {SUPPORTED_REGIONS[stateVal].map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.smallTabBtn, districtVal === d && styles.smallTabBtnActive]}
                    onPress={() => setDistrictVal(d)}
                  >
                    <Text style={[styles.smallTabBtnText, districtVal === d && styles.smallTabBtnTextActive]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : null}

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>LAND SIZE (ACRES)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              value={landVal}
              onChangeText={setLandVal}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity
            style={styles.submitBtn}
            disabled={profileLoading}
            onPress={handleProfileComplete}
          >
            <Text style={styles.submitBtnText}>{profileLoading ? 'Setting Up...' : 'Start Farming! →'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Sidebar Links config based on role
  const farmerLinks = [
    { key: 'dashboard', label: t('nav.dashboard'), emoji: '📊' },
    { key: 'profile', label: t('nav.profile'), emoji: '👤' },
    { key: 'crops', label: t('nav.crops'), emoji: '🌿' },
    { key: 'soil', label: t('soilAdvisor'), emoji: '🧪' },
    { key: 'scan', label: t('nav.scan'), emoji: '📷' },
    { key: 'weather', label: t('nav.weather'), emoji: '☀️' },
    { key: 'market', label: t('nav.market'), emoji: '📈' },
    { key: 'expenses', label: t('nav.expenses'), emoji: '💰' },
    { key: 'whatif', label: t('nav.whatif'), emoji: '🧮' },
    { key: 'alerts', label: t('nav.alerts'), emoji: '🔔' },
    { key: 'settings', label: t('nav.settings'), emoji: '⚙️' }
  ];

  const officerLinks = [
    { key: 'dashboard', label: t('nav.dashboard'), emoji: '📊' },
    { key: 'farmers', label: t('nav.farmers'), emoji: '👥' },
    { key: 'reports', label: t('nav.reports'), emoji: '📝' },
    { key: 'broadcast', label: t('nav.broadcast'), emoji: '📢' },
    { key: 'settings', label: t('nav.settings'), emoji: '⚙️' }
  ];

  const adminLinks = [
    { key: 'dashboard', label: t('nav.dashboard'), emoji: '📊' },
    { key: 'officers', label: t('nav.officers'), emoji: '👮' },
    { key: 'users', label: t('nav.users'), emoji: '👥' },
    { key: 'database', label: t('nav.database'), emoji: '🗄️' },
    { key: 'settings', label: t('nav.settings'), emoji: '⚙️' }
  ];

  const links = user.role === 'farmer' ? farmerLinks : user.role === 'officer' ? officerLinks : adminLinks;
  const roleThemeColor = user.role === 'farmer' ? COLORS.farmer : user.role === 'officer' ? COLORS.officer : COLORS.admin;

  const navigateToTab = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigation.replace('Login');
  };

  // Render Subpages
  const renderFarmerDashboard = () => {
    const activeCropData = crops.find((c) => c.name === user.activeCrop);
    const farmerExpenses = expenses.filter((e) => e.farmerId === user.id);
    const totalExpenses = farmerExpenses.reduce((sum, e) => sum + e.amount, 0);
    const estProfit = activeCropData ? activeCropData.currentPrice * (user.landSize || 1) * 2.5 : 0;

    return (
      <View style={styles.viewContainer}>
        {/* Banner */}
        <View style={[styles.dashboardBanner, { backgroundColor: roleThemeColor }]}>
          <Text style={styles.bannerGreeting}>{t('dashboard.greeting')},</Text>
          <Text style={styles.bannerName}>{user.name} 👨‍🌾</Text>
          <Text style={styles.bannerDistrict}>📍 {user.district}, {user.state}</Text>

          {activeCropData ? (
            <View style={styles.activeCropCard}>
              <View style={styles.activeCropHeader}>
                <Text style={styles.activeCropEmoji}>{activeCropData.emoji}</Text>
                <View>
                  <Text style={styles.activeCropLabel}>{t('dashboard.activeCrop')}</Text>
                  <Text style={styles.activeCropName}>{activeCropData.name}</Text>
                </View>
              </View>
              <View style={styles.activeCropDivider} />
              <View style={styles.activeCropFooter}>
                <Text style={styles.activeCropEstLabel}>{t('dashboard.estProfit')}</Text>
                <Text style={styles.activeCropEstValue}>₹{estProfit.toLocaleString()}</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.selectCropPrompt} onPress={() => setActiveTab('crops')}>
              <Text style={styles.selectCropPromptText}>+ Select Active Crop</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('dashboard.quickActions')}</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: colors.surface }]} onPress={() => setActiveTab('scan')}>
            <Text style={styles.quickActionEmoji}>📷</Text>
            <Text style={[styles.quickActionText, { color: colors.text }]}>{t('nav.scan')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: colors.surface }]} onPress={() => setActiveTab('crops')}>
            <Text style={styles.quickActionEmoji}>🌿</Text>
            <Text style={[styles.quickActionText, { color: colors.text }]}>{t('nav.crops')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: colors.surface }]} onPress={() => setActiveTab('market')}>
            <Text style={styles.quickActionEmoji}>📈</Text>
            <Text style={[styles.quickActionText, { color: colors.text }]}>{t('nav.market')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: colors.surface }]} onPress={() => setActiveTab('expenses')}>
            <Text style={styles.quickActionEmoji}>💰</Text>
            <Text style={[styles.quickActionText, { color: colors.text }]}>{t('nav.expenses')}</Text>
          </TouchableOpacity>
        </View>

        {/* Financial Summary */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Financial Summary</Text>
          <View style={styles.financialRow}>
            <Text style={[styles.financialLabel, { color: colors.textMuted }]}>{t('dashboard.expenses')}</Text>
            <Text style={[styles.financialVal, { color: COLORS.danger }]}>₹{totalExpenses.toLocaleString()}</Text>
          </View>
          <View style={styles.financialRow}>
            <Text style={[styles.financialLabel, { color: colors.textMuted }]}>{t('dashboard.netProfit')}</Text>
            <Text style={[styles.financialVal, { color: COLORS.success }]}>₹{(estProfit - totalExpenses).toLocaleString()}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderSoilAdvisor = () => {
    const handleSoilAnalyze = () => {
      // Mock soil analysis logic
      const cropRecs = crops.filter(c => c.idealSoil.includes(soilInput.soilType)).map(c => c.name);
      setSoilAdvice({
        n: '45 kg/Acre (Sufficient)',
        p: '22 kg/Acre (Deficient - Add Rock Phosphate)',
        k: '60 kg/Acre (High)',
        recommendations: cropRecs.length > 0 ? cropRecs : ['Wheat', 'Rice']
      });
    };

    return (
      <View style={styles.viewContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('soilAdvisor')}</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardSubtitle, { color: colors.text }]}>Soil Analysis Parameter Inputs</Text>
          
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>SOIL TYPE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {['Black', 'Red', 'Loamy', 'Sandy', 'Clay', 'Alluvial'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.smallTabBtn, soilInput.soilType === type && styles.smallTabBtnActive]}
                  onPress={() => setSoilInput({ ...soilInput, soilType: type })}
                >
                  <Text style={[styles.smallTabBtnText, soilInput.soilType === type && styles.smallTabBtnTextActive]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>SOIL pH VALUE (e.g. 6.5)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
              value={soilInput.ph}
              onChangeText={(val) => setSoilInput({ ...soilInput, ph: val })}
            />
          </View>

          <TouchableOpacity style={styles.actionBtn} onPress={handleSoilAnalyze}>
            <Text style={styles.actionBtnText}>Analyze Soil Health</Text>
          </TouchableOpacity>
        </View>

        {soilAdvice ? (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Soil Nutrition Report</Text>
            <View style={styles.nutrientBadgeContainer}>
              <View style={[styles.nutrientBadge, { backgroundColor: '#E0F2FE' }]}>
                <Text style={{ color: '#0369A1', fontWeight: '800' }}>Nitrogen (N)</Text>
                <Text style={{ fontSize: 12 }}>{soilAdvice.n}</Text>
              </View>
              <View style={[styles.nutrientBadge, { backgroundColor: '#FEE2E2' }]}>
                <Text style={{ color: '#B91C1C', fontWeight: '800' }}>Phosphorus (P)</Text>
                <Text style={{ fontSize: 12 }}>{soilAdvice.p}</Text>
              </View>
              <View style={[styles.nutrientBadge, { backgroundColor: '#DCFCE7' }]}>
                <Text style={{ color: '#15803D', fontWeight: '800' }}>Potassium (K)</Text>
                <Text style={{ fontSize: 12 }}>{soilAdvice.k}</Text>
              </View>
            </View>

            <Text style={[styles.label, { color: colors.textMuted, marginTop: 16 }]}>RECOMMENDED CROPS</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {soilAdvice.recommendations.map((cropName: string) => (
                <View key={cropName} style={[styles.tag, { backgroundColor: 'rgba(0, 184, 148, 0.15)' }]}>
                  <Text style={{ color: COLORS.success, fontWeight: '800', fontSize: 12 }}>{cropName}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    );
  };

  const renderWeather = () => {
    return (
      <View style={styles.viewContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('nav.weather')} Forecast</Text>
        <View style={[styles.weatherCard, { backgroundColor: COLORS.info }]}>
          <Text style={styles.weatherTemp}>32°C</Text>
          <Text style={styles.weatherCondition}>☀️ Sunny Day</Text>
          <Text style={styles.weatherDetails}>Humidity: 45%  |  Wind: 12 km/h  |  Rain Chance: 5%</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>5-Day Outlook</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weatherForecastScroll}>
          {[
            { day: 'Wed', temp: '33°', emoji: '☀️' },
            { day: 'Thu', temp: '31°', emoji: '🌤️' },
            { day: 'Fri', temp: '29°', emoji: '🌧️' },
            { day: 'Sat', temp: '30°', emoji: '🌥️' },
            { day: 'Sun', temp: '32°', emoji: '☀️' }
          ].map((item, index) => (
            <View key={index} style={[styles.forecastDayCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.forecastDayText, { color: colors.textMuted }]}>{item.day}</Text>
              <Text style={styles.forecastEmoji}>{item.emoji}</Text>
              <Text style={[styles.forecastTemp, { color: colors.text }]}>{item.temp}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderCrops = () => {
    return (
      <View style={styles.viewContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Crops Catalog & Advisory</Text>
        {crops.map((crop) => (
          <View key={crop.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cropRow}>
              <Text style={{ fontSize: 24 }}>{crop.emoji}</Text>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>{crop.name}</Text>
                <Text style={{ fontSize: 12, color: colors.textMuted }}>Avg Yield: {crop.avgYieldPerAcre} quintals/Acre</Text>
              </View>
              {user.activeCrop === crop.name ? (
                <View style={[styles.tag, { backgroundColor: roleThemeColor }]}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>Active</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.smallTabBtn, { backgroundColor: colors.bg }]}
                  onPress={() => setActiveCrop(crop.id)}
                >
                  <Text style={{ color: colors.text, fontSize: 11, fontWeight: '800' }}>Set Active</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderMarket = () => {
    return (
      <View style={styles.viewContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Market Mandi Prices</Text>
        {prices.length > 0 ? (
          prices.map((p, index) => (
            <View key={index} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>{p.cropName}</Text>
              <Text style={{ fontSize: 12, color: colors.textMuted }}>Mandi: {p.mandiName} ({p.district})</Text>
              <View style={styles.cropDivider} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                <Text style={{ color: COLORS.success, fontWeight: '700' }}>Min: ₹{p.minPrice}</Text>
                <Text style={{ color: colors.text, fontWeight: '800' }}>Modal: ₹{p.modalPrice}</Text>
                <Text style={{ color: COLORS.danger, fontWeight: '700' }}>Max: ₹{p.maxPrice}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={{ color: colors.textMuted, textAlign: 'center', marginVertical: 20 }}>No prices available</Text>
        )}
      </View>
    );
  };

  const renderExpenses = () => {
    const activeCropData = crops.find((c) => c.name === user.activeCrop);
    const farmerExpenses = expenses.filter((e) => e.farmerId === user.id);

    const handleAddExpense = async () => {
      if (!expenseForm.amount) return;
      await addExpense({
        type: expenseForm.category,
        amount: Number(expenseForm.amount),
        cropId: activeCropData?.id || crops[0]?.id
      });
      setExpenseForm({ ...expenseForm, amount: '' });
      Alert.alert('Success', 'Expense logged successfully!');
    };

    return (
      <View style={styles.viewContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Manage Farm Expenses</Text>
        
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Add Expense Log</Text>
          
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>CATEGORY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {['Labor', 'Fertilizer', 'Irrigation', 'Seed', 'Pesticide', 'Other'].map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.smallTabBtn, expenseForm.category === c && styles.smallTabBtnActive]}
                  onPress={() => setExpenseForm({ ...expenseForm, category: c })}
                >
                  <Text style={[styles.smallTabBtnText, expenseForm.category === c && styles.smallTabBtnTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>AMOUNT (INR)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
              value={expenseForm.amount}
              onChangeText={(val) => setExpenseForm({ ...expenseForm, amount: val })}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity style={styles.actionBtn} onPress={handleAddExpense}>
            <Text style={styles.actionBtnText}>Save Expense Log</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Expense Logs History</Text>
        {farmerExpenses.map((exp) => (
          <View key={exp.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>{exp.category}</Text>
                <Text style={{ fontSize: 11, color: colors.textMuted }}>{exp.date.split('T')[0]}</Text>
              </View>
              <Text style={{ fontSize: 16, fontWeight: '800', color: COLORS.danger }}>- ₹{exp.amount}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderWhatIf = () => {
    const handleWhatIfAnalyze = () => {
      const selected = crops.find(c => c.name === whatIfInput.cropName);
      if (!selected) return;
      const parsedPrice = Number(whatIfInput.cropPrice) || selected.currentPrice;
      const revenue = parsedPrice * Number(whatIfInput.landSize) * 2.5;
      const seedExp = Number(whatIfInput.landSize) * 2000;
      const laborExp = Number(whatIfInput.landSize) * 4000;
      const miscExp = Number(whatIfInput.landSize) * 1500;
      const totalExp = seedExp + laborExp + miscExp;
      setWhatIfResult({
        cropName: selected.name,
        revenue,
        totalExp,
        netProfit: revenue - totalExp
      });
    };

    return (
      <View style={styles.viewContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>What-If Crop Profit Simulator</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>SELECT CROP</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {crops.map(c => (
                <TouchableOpacity
                  key={c.name}
                  style={[styles.smallTabBtn, whatIfInput.cropName === c.name && styles.smallTabBtnActive]}
                  onPress={() => setWhatIfInput({ ...whatIfInput, cropName: c.name })}
                >
                  <Text style={[styles.smallTabBtnText, whatIfInput.cropName === c.name && styles.smallTabBtnTextActive]}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>LAND SIZE (ACRES)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
              value={whatIfInput.landSize}
              onChangeText={(val) => setWhatIfInput({ ...whatIfInput, landSize: val })}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity style={styles.actionBtn} onPress={handleWhatIfAnalyze}>
            <Text style={styles.actionBtnText}>Simulate Profit Outcome</Text>
          </TouchableOpacity>
        </View>

        {whatIfResult ? (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Simulation Forecast Summary</Text>
            <View style={styles.financialRow}>
              <Text style={{ color: colors.textMuted }}>Estimated Revenue</Text>
              <Text style={{ color: COLORS.success, fontWeight: '800' }}>+ ₹{whatIfResult.revenue.toLocaleString()}</Text>
            </View>
            <View style={styles.financialRow}>
              <Text style={{ color: colors.textMuted }}>Estimated Expenses</Text>
              <Text style={{ color: COLORS.danger, fontWeight: '800' }}>- ₹{whatIfResult.totalExp.toLocaleString()}</Text>
            </View>
            <View style={styles.cropDivider} />
            <View style={styles.financialRow}>
              <Text style={{ fontWeight: '800', color: colors.text }}>Net Profit Projection</Text>
              <Text style={{ color: roleThemeColor, fontWeight: '800', fontSize: 18 }}>₹{whatIfResult.netProfit.toLocaleString()}</Text>
            </View>
          </View>
        ) : null}
      </View>
    );
  };

  const renderScan = () => {
    const handleScanMock = () => {
      // Mock Disease detection
      Alert.alert('AI Disease Report', 'Spotted Spider Mite infestation detected! Confidence: 94%. Severity: High. Treatment: Apply Neem Oil spray immediately.');
    };

    return (
      <View style={styles.viewContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>AI Disease Scanner</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, alignItems: 'center' }]}>
          <Text style={{ fontSize: 60, marginVertical: 20 }}>📸</Text>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Capture Leaf Photograph</Text>
          <Text style={{ color: colors.textMuted, textAlign: 'center', marginBottom: 20, fontSize: 12 }}>
            Position the infected crop leaf clearly inside the viewfinder.
          </Text>

          <TouchableOpacity style={styles.actionBtn} onPress={handleScanMock}>
            <Text style={styles.actionBtnText}>Analyze Crop Health</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderAlerts = () => {
    const handleSendReply = async (alertId: string) => {
      const msg = replyMsg[alertId];
      if (!msg) return;
      await replyToBroadcast(alertId, msg);
      setReplyMsg({ ...replyMsg, [alertId]: '' });
      Alert.alert('Success', 'Reply sent successfully!');
    };

    return (
      <View style={styles.viewContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Broadcast Communications</Text>
        {broadcasts.map((b) => (
          <View key={b.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={[styles.tag, { backgroundColor: b.type === 'danger' ? COLORS.danger : COLORS.warning }]}>
                <Text style={{ color: '#fff', fontSize: 9, fontWeight: '800' }}>{b.type.toUpperCase()}</Text>
              </View>
              <Text style={{ fontSize: 11, color: colors.textMuted }}>{b.date.split('T')[0]}</Text>
            </View>
            <Text style={[styles.alertMsgText, { color: colors.text, marginVertical: 8 }]}>{b.message}</Text>
            <Text style={{ fontSize: 11, color: colors.textMuted }}>District Target: {b.district}</Text>

            {b.allowReplies ? (
              <View style={{ marginTop: 12 }}>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border, paddingVertical: 8 }]}
                  placeholder="Type a query reply..."
                  placeholderTextColor={colors.textMuted}
                  value={replyMsg[b.id] || ''}
                  onChangeText={(val) => setReplyMsg({ ...replyMsg, [b.id]: val })}
                />
                <TouchableOpacity style={[styles.actionBtn, { marginTop: 6, paddingVertical: 8 }]} onPress={() => handleSendReply(b.id)}>
                  <Text style={styles.actionBtnText}>Send Message Reply</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        ))}
      </View>
    );
  };

  // Officer view renders
  const renderOfficerDashboard = () => {
    return (
      <View style={styles.viewContainer}>
        <View style={[styles.dashboardBanner, { backgroundColor: roleThemeColor }]}>
          <Text style={styles.bannerGreeting}>{t('dashboard.greeting')},</Text>
          <Text style={styles.bannerName}>{user.name} 👮</Text>
          <Text style={styles.bannerDistrict}>District Office: {user.district}</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Dashboard Insights</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={[styles.card, { flex: 1, backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={{ fontSize: 24 }}>🌾</Text>
            <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>FARMERS MONITORED</Text>
            <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>{farmers.length}</Text>
          </View>
          <View style={[styles.card, { flex: 1, backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={{ fontSize: 24 }}>🪲</Text>
            <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>PENDING REPORTS</Text>
            <Text style={{ fontSize: 22, fontWeight: '800', color: COLORS.danger }}>
              {diseaseReports.filter(r => r.status === 'pending').length}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderFarmersList = () => {
    return (
      <View style={styles.viewContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Registered District Farmers</Text>
        {farmers.map((f) => (
          <View key={f.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>{f.name}</Text>
            <Text style={{ fontSize: 12, color: colors.textMuted }}>District: {f.district}  |  Land: {f.landSize} Acres</Text>
            <Text style={{ fontSize: 12, color: colors.textMuted }}>Crop: {f.activeCrop || 'No Active Crop'}</Text>
            <Text style={{ fontSize: 12, color: colors.textMuted }}>Phone: {f.phone || 'N/A'}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderDiseaseReports = () => {
    return (
      <View style={styles.viewContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Disease Reports</Text>
        {diseaseReports.map((r) => (
          <View key={r.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>{r.diseaseName}</Text>
              <View style={[styles.tag, { backgroundColor: r.status === 'pending' ? COLORS.danger : COLORS.success }]}>
                <Text style={{ color: '#fff', fontSize: 9, fontWeight: '800' }}>{r.status.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={{ fontSize: 12, color: colors.textMuted, marginVertical: 6 }}>
              Crop: {r.cropName} | Confidence: {r.confidence}%
            </Text>
            {r.status === 'pending' ? (
              <TouchableOpacity style={styles.actionBtn} onPress={() => resolveDisease(r.id)}>
                <Text style={styles.actionBtnText}>Resolve & Close Issue</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ))}
      </View>
    );
  };

  const renderBroadcast = () => {
    const handleSendBroadcast = async () => {
      if (!broadcastMsg) return;
      await sendBroadcast(broadcastMsg, broadcastType, true);
      setBroadcastMsg('');
      Alert.alert('Success', 'Broadcast message sent successfully!');
    };

    return (
      <View style={styles.viewContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Broadcast Message Alerts</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>MESSAGE ALERT CONTENT</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border, height: 100 }]}
              multiline
              value={broadcastMsg}
              onChangeText={setBroadcastMsg}
              placeholder="Type urgent farming update message..."
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>ALERT SEVERITY LEVEL</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {['warning', 'danger', 'info'].map((lvl) => (
                <TouchableOpacity
                  key={lvl}
                  style={[styles.smallTabBtn, broadcastType === lvl && styles.smallTabBtnActive]}
                  onPress={() => setBroadcastType(lvl)}
                >
                  <Text style={[styles.smallTabBtnText, broadcastType === lvl && styles.smallTabBtnTextActive]}>
                    {lvl.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.actionBtn} onPress={handleSendBroadcast}>
            <Text style={styles.actionBtnText}>Broadcast Alert Message</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Admin view renders
  const renderAdminDashboard = () => {
    return (
      <View style={styles.viewContainer}>
        <View style={[styles.dashboardBanner, { backgroundColor: roleThemeColor }]}>
          <Text style={styles.bannerGreeting}>{t('dashboard.greeting')},</Text>
          <Text style={styles.bannerName}>{user.name} 👮</Text>
          <Text style={styles.bannerDistrict}>System Administrator Control</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>System Database Metrics</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={[styles.card, { flex: 1, backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>{farmers.length + officers.length}</Text>
            <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>TOTAL USERS</Text>
          </View>
          <View style={[styles.card, { flex: 1, backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>{crops.length}</Text>
            <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>CROP TYPES</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderManageOfficers = () => {
    const handleAddOfficer = async () => {
      if (!newOfficerForm.name || !newOfficerForm.email) return;
      await addOfficer(newOfficerForm);
      setNewOfficerForm({ name: '', email: '', password: 'password', district: 'Nashik', state: 'Maharashtra' });
      Alert.alert('Success', 'Officer account registered successfully!');
    };

    return (
      <View style={styles.viewContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Register District Officers</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>NAME</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
              value={newOfficerForm.name}
              onChangeText={(val) => setNewOfficerForm({ ...newOfficerForm, name: val })}
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>EMAIL</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
              value={newOfficerForm.email}
              onChangeText={(val) => setNewOfficerForm({ ...newOfficerForm, email: val })}
            />
          </View>
          <TouchableOpacity style={styles.actionBtn} onPress={handleAddOfficer}>
            <Text style={styles.actionBtnText}>Register Account</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Officers List</Text>
        {officers.map((o) => (
          <View key={o.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>{o.name}</Text>
            <Text style={{ fontSize: 12, color: colors.textMuted }}>District Target: {o.district}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderManageUsers = () => {
    return (
      <View style={styles.viewContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Register users control</Text>
        {farmers.map((f) => (
          <View key={f.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>{f.name}</Text>
            <Text style={{ fontSize: 12, color: colors.textMuted }}>Role: {f.role} | Status: {f.isActive ? 'Active' : 'Banned'}</Text>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <TouchableOpacity
                style={[styles.smallTabBtn, { backgroundColor: COLORS.danger }]}
                onPress={() => deleteUser(f.id)}
              >
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.smallTabBtn, { backgroundColor: COLORS.success }]}
                onPress={() => updateUserStatus(f.id, !f.isActive)}
              >
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>
                  {f.isActive ? 'Suspend' : 'Activate'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderCropDatabase = () => {
    const handleAddCrop = async () => {
      if (!newCropForm.name) return;
      await addCrop({
        name: newCropForm.name,
        soilTypes: [newCropForm.idealSoil],
        season: [newCropForm.season],
        avgYieldPerAcre: Number(newCropForm.avgYield)
      });
      setNewCropForm({ name: '', idealSoil: 'Loamy', season: 'Kharif', avgYield: '2.5' });
      Alert.alert('Success', 'Crop registered into database successfully!');
    };

    return (
      <View style={styles.viewContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Register Crop Types</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>CROP TYPE NAME</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
              value={newCropForm.name}
              onChangeText={(val) => setNewCropForm({ ...newCropForm, name: val })}
            />
          </View>
          <TouchableOpacity style={styles.actionBtn} onPress={handleAddCrop}>
            <Text style={styles.actionBtnText}>Register Crop Type</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Crop Registry</Text>
        {crops.map((c) => (
          <View key={c.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>{c.name}</Text>
              <TouchableOpacity
                style={{ marginLeft: 'auto', padding: 6 }}
                onPress={() => deleteCrop(c.id)}
              >
                <Text style={{ color: COLORS.danger, fontWeight: '800' }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderSettings = () => {
    return (
      <View style={styles.viewContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('nav.settings')}</Text>
        
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Language Option</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {(['en', 'hi', 'mr', 'ta', 'te'] as const).map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[styles.smallTabBtn, language === lang && styles.smallTabBtnActive]}
                onPress={() => setLanguage(lang)}
              >
                <Text style={[styles.smallTabBtnText, language === lang && styles.smallTabBtnTextActive]}>
                  {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : lang === 'mr' ? 'मराठी' : lang === 'ta' ? 'தமிழ்' : 'తెలుగు'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Theme Display</Text>
          <TouchableOpacity style={styles.actionBtn} onPress={toggleTheme}>
            <Text style={styles.actionBtnText}>
              Switch to {theme === 'light' ? 'Dark Theme' : 'Light Theme'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: COLORS.danger }]} onPress={handleLogout}>
          <Text style={styles.submitBtnText}>Sign Out Account</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return user.role === 'farmer' ? renderFarmerDashboard() : user.role === 'officer' ? renderOfficerDashboard() : renderAdminDashboard();
      case 'profile':
        return renderSettings(); // Map profile to settings options
      case 'soil':
        return renderSoilAdvisor();
      case 'weather':
        return renderWeather();
      case 'crops':
        return renderCrops();
      case 'market':
        return renderMarket();
      case 'expenses':
        return renderExpenses();
      case 'whatif':
        return renderWhatIf();
      case 'scan':
        return renderScan();
      case 'alerts':
        return renderAlerts();
      case 'farmers':
        return renderFarmersList();
      case 'reports':
        return renderDiseaseReports();
      case 'broadcast':
        return renderBroadcast();
      case 'officers':
        return renderManageOfficers();
      case 'users':
        return renderManageUsers();
      case 'database':
        return renderCropDatabase();
      case 'settings':
        return renderSettings();
      default:
        return renderFarmerDashboard();
    }
  };

  return (
    <SafeAreaView style={[styles.mainContainer, { backgroundColor: colors.bg }]}>
      {/* Top Header */}
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.menuBtn} onPress={() => setMobileMenuOpen(true)}>
          <Text style={[styles.menuBtnText, { color: colors.text }]}>☰</Text>
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: colors.text }]}>CropAdvisor</Text>
        <TouchableOpacity onPress={toggleTheme}>
          <Text style={{ fontSize: 18 }}>{theme === 'dark' ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>

      {/* Floating Menu Drawer */}
      {mobileMenuOpen && (
        <Modal visible={mobileMenuOpen} transparent animationType="slide">
          <View style={styles.drawerBackdrop}>
            <View style={[styles.drawerContent, { backgroundColor: roleThemeColor }]}>
              <View style={styles.drawerHeader}>
                <Text style={styles.drawerTitle}>Menu</Text>
                <TouchableOpacity onPress={() => setMobileMenuOpen(false)}>
                  <Text style={styles.drawerCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.drawerLinks}>
                {links.map((link) => (
                  <TouchableOpacity
                    key={link.key}
                    style={[styles.drawerLink, activeTab === link.key && styles.drawerLinkActive]}
                    onPress={() => navigateToTab(link.key)}
                  >
                    <Text style={styles.drawerLinkText}>{link.emoji} {link.label}</Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity style={[styles.drawerLink, { marginTop: 20 }]} onPress={handleLogout}>
                  <Text style={styles.drawerLinkText}>🚪 Sign Out</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Active Screen content */}
      <ScrollView contentContainerStyle={styles.viewScroll}>
        {renderActiveScreen()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  topBar: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  menuBtn: {
    padding: 8,
  },
  menuBtnText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Playfair Display' : 'sans-serif',
  },
  viewScroll: {
    paddingBottom: 40,
  },
  viewContainer: {
    padding: 16,
    gap: 16,
  },
  dashboardBanner: {
    borderRadius: 24,
    padding: 20,
  },
  bannerGreeting: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  bannerName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  bannerDistrict: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: 4,
  },
  activeCropCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  activeCropHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activeCropEmoji: {
    fontSize: 28,
  },
  activeCropLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '700',
  },
  activeCropName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  activeCropDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 12,
  },
  activeCropFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeCropEstLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
  activeCropEstValue: {
    color: '#F59E0B',
    fontSize: 20,
    fontWeight: '800',
  },
  selectCropPrompt: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderStyle: 'dashed',
  },
  selectCropPromptText: {
    color: '#fff',
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 8,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  quickActionEmoji: {
    fontSize: 22,
    marginBottom: 6,
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: '700',
  },
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    gap: 12,
    ...commonStyles.shadow,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  financialLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  financialVal: {
    fontSize: 14,
    fontWeight: '800',
  },
  formGroup: {
    gap: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  actionBtn: {
    backgroundColor: '#2D4F39',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },
  smallTabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: 6,
  },
  smallTabBtnActive: {
    backgroundColor: '#2D4F39',
  },
  smallTabBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  smallTabBtnTextActive: {
    color: '#fff',
  },
  cropRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cropDivider: {
    height: 1,
    backgroundColor: '#f3f4f6',
  },
  nutrientBadgeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  nutrientBadge: {
    flex: 1,
    borderRadius: 12,
    padding: 10,
    gap: 4,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  weatherCard: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  weatherTemp: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
  },
  weatherCondition: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  weatherDetails: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
  },
  weatherForecastScroll: {
    flexDirection: 'row',
  },
  forecastDayCard: {
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: 60,
    marginRight: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  forecastDayText: {
    fontSize: 11,
    fontWeight: '700',
  },
  forecastEmoji: {
    fontSize: 18,
  },
  forecastTemp: {
    fontSize: 12,
    fontWeight: '800',
  },
  alertMsgText: {
    fontSize: 13,
    fontWeight: '600',
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  drawerContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    maxHeight: '80%',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  drawerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
  },
  drawerCloseText: {
    color: '#fff',
    fontSize: 20,
  },
  drawerLinks: {
    marginBottom: 20,
  },
  drawerLink: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  drawerLinkActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  drawerLinkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  profileCompleteContainer: {
    flex: 1,
  },
  profileCompleteContent: {
    padding: 24,
    gap: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCompleteEmoji: {
    fontSize: 48,
  },
  profileCompleteTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  profileCompleteText: {
    textAlign: 'center',
    fontSize: 13,
    marginBottom: 20,
  },
  submitBtn: {
    backgroundColor: '#2D4F39',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '800',
  },
});
