import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ApiService from "../services/apiService";
import { useUser } from "../navigation/AppNavigator";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { setUserData } = useUser();


  
  const handleLogin = async () => {  // ← Precisa ter 'async' aqui
  if (!email || !senha) {
    Alert.alert("Erro", "Por favor, preencha todos os campos");
    return;
  }

  setLoading(true);

  try {
    const response = await ApiService.login(email, senha);
    
    // LOGS DE DEBUG:
    console.log("📱 RESPOSTA BRUTA:", response);
    console.log("📱 TIPO DA RESPOSTA:", typeof response);
    console.log("📱 KEYS DA RESPOSTA:", Object.keys(response || {}));
    console.log("📱 RESPONSE.MOTORISTA:", response?.motorista);
    console.log("📱 RESPONSE.SUCCESS:", response?.success);
    
    Alert.alert("Sucesso", response.message);
    
    // Verificar qual campo contém os dados:
    if (response?.motorista) {
      console.log("✅ Usando response.motorista");
      setUserData(response.motorista);
    } else if (response?.usuario) {
      console.log("✅ Usando response.usuario");  
      setUserData(response.usuario);
    } else {
      console.log("❌ Nenhum dado de usuário encontrado na resposta");
    }

    navigation.navigate("Main");
    
    // Limpar campos após login bem-sucedido
    setEmail("");
    setSenha("");
  } catch (error) {
    Alert.alert("Erro", error.message);
    console.error("Erro no login:", error);
  } finally {
    setLoading(false);
  }
};
  const handleForgotPassword = () => {
    Alert.alert(
      "Recuperar Senha",
      "Funcionalidade de recuperação de senha será implementada em breve!",
      [{ text: "OK" }]
    );
  };

  const handleSignUp = () => {
    navigation.navigate("Cadastro");
  };

  const handleTouchID = () => {
    Alert.alert(
      "Biometria",
      "Touch ID/Face ID será implementado em breve!",
      [{ text: "OK" }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header com gradiente */}
          <View style={styles.header}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <View style={styles.logoBox}>
                <Ionicons name="car-sport" size={32} color="white" />
              </View>
            </View>

            {/* Título */}
            <Text style={styles.title}>NALM GO</Text>
            <Text style={styles.subtitle}>Transporte Simplificado</Text>

            {/* Badge Motorista */}
            <View style={styles.badgeContainer}>
              <View style={styles.badge}>
                <Ionicons name="person" size={16} color="white" />
                <Text style={styles.badgeText}>Área do Motorista</Text>
              </View>
            </View>
          </View>

          {/* Formulário */}
          <View style={styles.formContainer}>
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Entrar na sua conta</Text>

              {/* Campo Email */}
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="mail" size={20} color="#8B5CF6" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Digite seu email"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>

              {/* Campo Senha */}
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="lock-closed" size={20} color="#8B5CF6" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Digite sua senha"
                  placeholderTextColor="#9CA3AF"
                  value={senha}
                  onChangeText={setSenha}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>

              {/* Esqueceu senha */}
              <TouchableOpacity onPress={handleForgotPassword} disabled={loading}>
                <Text style={styles.forgotPassword}>Esqueceu sua senha?</Text>
              </TouchableOpacity>

              {/* Botão Login */}
              <TouchableOpacity
                style={[styles.loginButton, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="white" size="small" />
                    <Text style={styles.loadingText}>Entrando...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.loginButtonText}>Entrar</Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                  </View>
                )}
              </TouchableOpacity>

              {/* Divisor */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Biometria */}
              <TouchableOpacity
                style={styles.biometricButton}
                onPress={handleTouchID}
                disabled={loading}
              >
                <Ionicons name="finger-print" size={24} color="#8B5CF6" />
                <Text style={styles.biometricText}>Usar Biometria</Text>
              </TouchableOpacity>
            </View>

            {/* Cadastro */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupQuestion}>Não tem uma conta?</Text>
              <TouchableOpacity onPress={handleSignUp} disabled={loading}>
                <Text style={styles.signupLink}>Cadastre-se aqui</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Header
  header: {
    backgroundColor: "#8B5CF6",
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 30,
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoBox: {
    width: 80,
    height: 80,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 20,
  },
  badgeContainer: {
    alignItems: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  badgeText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },

  // Form
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  formCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 30,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 24,
    textAlign: "center",
  },

  // Inputs
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  inputIconContainer: {
    paddingLeft: 16,
    paddingRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingRight: 16,
    fontSize: 16,
    color: "#1F2937",
  },
  eyeIcon: {
    paddingHorizontal: 16,
  },

  // Forgot Password
  forgotPassword: {
    color: "#8B5CF6",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "right",
    marginBottom: 24,
  },

  // Login Button
  loginButton: {
    backgroundColor: "#8B5CF6",
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 24,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },

  // Divider
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    color: "#9CA3AF",
    fontSize: 14,
    marginHorizontal: 16,
  },

  // Biometric
  biometricButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  biometricText: {
    color: "#8B5CF6",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },

  // Signup
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  signupQuestion: {
    color: "#6B7280",
    fontSize: 16,
  },
  signupLink: {
    color: "#8B5CF6",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 4,
  },
});

export default LoginScreen;