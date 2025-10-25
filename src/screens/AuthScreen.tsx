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
      <StatusBar barStyle="light-content" />
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
                  <Text style={styles.logoText}>S</Text>
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
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  value={password}
                  placeholderTextColor="#94A3B8"
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <View style={styles.eyeIconContainer}>
                    {showPassword ? (
                      <View style={styles.eyeOpen}>
                        <View style={styles.eyePupil} />
                      </View>
                    ) : (
                      <View style={styles.eyeClosed} />
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleAuth}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
              </Text>
            </TouchableOpacity>

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
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  backgroundGradient: {
    position: 'absolute',
    width: width,
    height: height,
    overflow: 'hidden',
    backgroundColor: '#0A0E27',
  },
  blob: {
    position: 'absolute',
    borderRadius: 1000,
  },
  blob1: {
    width: 450,
    height: 450,
    backgroundColor: '#6366F1',
    opacity: 0.15,
    top: -150,
    left: -100,
  },
  blob2: {
    width: 380,
    height: 380,
    backgroundColor: '#8B5CF6',
    opacity: 0.12,
    bottom: -120,
    right: -50,
  },
  blob3: {
    width: 320,
    height: 320,
    backgroundColor: '#06B6D4',
    opacity: 0.1,
    top: height * 0.35,
    right: -120,
  },
  blob4: {
    width: 280,
    height: 280,
    backgroundColor: '#EC4899',
    opacity: 0.08,
    top: height * 0.15,
    left: width * 0.6,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 14, 39, 0.3)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  logoInner: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    borderWidth: 2,
    borderColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
  },
  logoText: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 44,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 15,
    color: '#94A3B8',
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  formContainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  inputContainer: {
    marginBottom: 18,
  },
  inputLabel: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 15,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 15,
    color: '#FFFFFF',
  },
  eyeButton: {
    padding: 14,
  },
  eyeIconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeOpen: {
    width: 22,
    height: 14,
    borderWidth: 2,
    borderColor: '#94A3B8',
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyePupil: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#94A3B8',
  },
  eyeClosed: {
    width: 22,
    height: 2,
    backgroundColor: '#94A3B8',
    borderRadius: 1,
  },
  button: {
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  switchButton: {
    marginTop: 18,
    alignItems: 'center',
    padding: 8,
  },
  switchText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  switchTextBold: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});

export default AuthScreen;