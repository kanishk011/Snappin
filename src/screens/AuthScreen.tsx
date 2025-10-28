import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SIZES } from '../config/theme';

const { width, height } = Dimensions.get('window');

const LiquidBlob = ({ delay = 0, style }: any) => {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.8, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 3500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    translateX.value = withRepeat(
      withSequence(
        withTiming(30, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-30, { duration: 4500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    translateY.value = withRepeat(
      withSequence(
        withTiming(-40, { duration: 4500, easing: Easing.inOut(Easing.ease) }),
        withTiming(40, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 3500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return <Animated.View style={[style, animatedStyle]} />;
};

const AuthScreen: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { signUp, signIn } = useAuth();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (isSignUp && !name) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password, name);
      } else {
        await signIn(email, password);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Liquid Background */}
        <View style={styles.backgroundGradient}>
          <LiquidBlob style={[styles.blob, styles.blob1]} delay={0} />
          <LiquidBlob style={[styles.blob, styles.blob2]} delay={1000} />
          <LiquidBlob style={[styles.blob, styles.blob3]} delay={2000} />
          <LiquidBlob style={[styles.blob, styles.blob4]} delay={1500} />
          <View style={styles.overlay} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Animated.View
            entering={FadeInUp.delay(200).duration(1000).springify()}
            style={styles.header}
          >
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <View style={styles.logoInner}>
                  <Ionicons name="chatbubbles" size={42} color={COLORS.white} />
                </View>
              </View>
            </View>
            <Text style={styles.title}>Snappin</Text>
            <Text style={styles.subtitle}>
              {isSignUp ? 'Create your account' : 'Welcome back!'}
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(400).duration(1000).springify()}
            style={styles.formContainer}
          >
            {isSignUp && (
              <View style={styles.inputContainer}>
                <View style={styles.inputLabelContainer}>
                  <Ionicons name="person-outline" size={16} color={COLORS.white} />
                  <Text style={styles.inputLabel}>Name</Text>
                </View>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person" size={20} color={COLORS.textLight} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your name"
                    placeholderTextColor={COLORS.textLight}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}

            <View style={styles.inputContainer}>
              <View style={styles.inputLabelContainer}>
                <Ionicons name="mail-outline" size={16} color={COLORS.white} />
                <Text style={styles.inputLabel}>Email</Text>
              </View>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail" size={20} color={COLORS.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  placeholderTextColor={COLORS.textLight}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputLabelContainer}>
                <Ionicons name="lock-closed-outline" size={16} color={COLORS.white} />
                <Text style={styles.inputLabel}>Password</Text>
              </View>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed" size={20} color={COLORS.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  value={password}
                  placeholderTextColor={COLORS.textLight}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? 'eye' : 'eye-off'}
                    size={22}
                    color={COLORS.textLight}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleAuth}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <>
                  <Text style={styles.buttonText}>
                    {isSignUp ? 'Sign Up' : 'Sign In'}
                  </Text>
                  <Ionicons
                    name={isSignUp ? 'person-add' : 'log-in'}
                    size={20}
                    color={COLORS.white}
                    style={styles.buttonIcon}
                  />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsSignUp(!isSignUp)}
              activeOpacity={0.7}
            >
              <Text style={styles.switchText}>
                {isSignUp
                  ? 'Already have an account? '
                  : "Don't have an account? "}
                <Text style={styles.switchTextBold}>
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Footer */}
          <Animated.View
            entering={FadeInUp.delay(600).duration(1000)}
            style={styles.footer}
          >
            <View style={styles.footerRow}>
              <Ionicons name="shield-checkmark" size={16} color={COLORS.primary} />
              <Text style={styles.footerText}>End-to-end encrypted</Text>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1729',
  },
  backgroundGradient: {
    position: 'absolute',
    width: width,
    height: height,
    overflow: 'hidden',
    backgroundColor: '#0F1729',
  },
  blob: {
    position: 'absolute',
    borderRadius: 1000,
  },
  blob1: {
    width: 450,
    height: 450,
    backgroundColor: COLORS.primary,
    opacity: 0.15,
    top: -150,
    left: -100,
  },
  blob2: {
    width: 380,
    height: 380,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.12,
    bottom: -120,
    right: -50,
  },
  blob3: {
    width: 320,
    height: 320,
    backgroundColor: COLORS.accent,
    opacity: 0.1,
    top: height * 0.35,
    right: -120,
  },
  blob4: {
    width: 280,
    height: 280,
    backgroundColor: COLORS.primaryDark,
    opacity: 0.08,
    top: height * 0.15,
    left: width * 0.6,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 41, 0.4)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SIZES.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SIZES['3xl'],
  },
  logoContainer: {
    marginBottom: SIZES.lg,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${COLORS.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  logoInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: `${COLORS.primary}30`,
    borderWidth: 3,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.white,
    marginBottom: SIZES.sm,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: SIZES.fontBase,
    color: COLORS.textLight,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  formContainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: SIZES.radiusLg * 2,
    padding: SIZES['2xl'],
    borderWidth: 1,
    borderColor: `${COLORS.primary}30`,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  inputContainer: {
    marginBottom: SIZES.lg,
  },
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.sm,
    marginLeft: SIZES.xs,
  },
  inputLabel: {
    color: COLORS.white,
    fontSize: SIZES.fontSm,
    fontWeight: '700',
    marginLeft: SIZES.sm,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    paddingHorizontal: SIZES.base,
  },
  inputIcon: {
    marginRight: SIZES.md,
  },
  input: {
    flex: 1,
    paddingVertical: SIZES.base,
    fontSize: SIZES.fontBase,
    color: COLORS.white,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: SIZES.base,
    fontSize: SIZES.fontBase,
    color: COLORS.white,
  },
  eyeButton: {
    padding: SIZES.md,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.base + 2,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.md,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    flexDirection: 'row',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.fontLg,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginLeft: SIZES.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SIZES.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
  },
  dividerText: {
    color: COLORS.textLight,
    fontSize: SIZES.fontSm,
    fontWeight: '600',
    marginHorizontal: SIZES.base,
  },
  switchButton: {
    alignItems: 'center',
    padding: SIZES.md,
  },
  switchText: {
    color: COLORS.textLight,
    fontSize: SIZES.fontSm,
  },
  switchTextBold: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: SIZES.fontSm,
  },
  footer: {
    marginTop: SIZES['2xl'],
    alignItems: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.textLight,
    fontSize: SIZES.fontSm,
    marginLeft: SIZES.sm,
  },
});

export default AuthScreen;
