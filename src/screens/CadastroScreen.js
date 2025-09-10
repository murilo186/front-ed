import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ApiService from "../services/apiService";

const CadastroScreen = ({ navigation }) => {
  const [nome, setNome] = useState("");
  const [usuario, setUsuario] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const formatCPF = (text) => {
    const cleanText = text.replace(/\D/g, "");

    if (cleanText.length <= 11) {
      let formatted = cleanText;
      if (cleanText.length > 3) {
        formatted = cleanText.replace(/(\d{3})(\d)/, "$1.$2");
      }
      if (cleanText.length > 6) {
        formatted = cleanText.replace(/(\d{3})(\d{3})(\d)/, "$1.$2.$3");
      }
      if (cleanText.length > 9) {
        formatted = cleanText.replace(/(\d{3})(\d{3})(\d{3})(\d)/, "$1.$2.$3-$4");
      }
      setCpf(formatted);
    }
  };

  const validateStep1 = () => {
    if (!nome || !usuario) {
      Alert.alert("Erro", "Por favor, preencha nome completo e usuário");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const cpfNumbers = cpf.replace(/\D/g, "");
    if (cpfNumbers.length !== 11) {
      Alert.alert("Erro", "CPF deve conter 11 dígitos");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Erro", "Digite um email válido");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (senha.length < 6) {
      Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres");
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSignUp = async () => {
    if (!validateStep3()) return;

    setLoading(true);

    try {
      const response = await ApiService.register({
        nome: nome.trim(),
        usuario: usuario.trim().toLowerCase(),
        cpf,
        email: email.trim().toLowerCase(),
        senha,
      });

      Alert.alert("Sucesso", response.message, [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ]);
    } catch (error) {
      Alert.alert("Erro", error.message);
      console.error("Erro no cadastro:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate("Login");
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Dados Pessoais</Text>
      <Text style={styles.stepSubtitle}>Vamos começar com suas informações básicas</Text>

      <View style={styles.inputContainer}>
        <View style={styles.inputIconContainer}>
          <Ionicons name="person" size={20} color="#10B981" />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Nome completo"
          placeholderTextColor="#9CA3AF"
          value={nome}
          onChangeText={setNome}
          autoCapitalize="words"
          editable={!loading}
        />
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.inputIconContainer}>
          <Ionicons name="at" size={20} color="#10B981" />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Nome de usuário"
          placeholderTextColor="#9CA3AF"
          value={usuario}
          onChangeText={setUsuario}
          autoCapitalize="none"
          editable={!loading}
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Documentos</Text>
      <Text style={styles.stepSubtitle}>Precisamos de alguns dados para verificação</Text>

      <View style={styles.inputContainer}>
        <View style={styles.inputIconContainer}>
          <Ionicons name="card" size={20} color="#F59E0B" />
        </View>
        <TextInput
          style={styles.input}
          placeholder="000.000.000-00"
          placeholderTextColor="#9CA3AF"
          value={cpf}
          onChangeText={formatCPF}
          keyboardType="numeric"
          maxLength={14}
          editable={!loading}
        />
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.inputIconContainer}>
          <Ionicons name="mail" size={20} color="#F59E0B" />
        </View>
        <TextInput
          style={styles.input}
          placeholder="seu@email.com"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Segurança</Text>
      <Text style={styles.stepSubtitle}>Crie uma senha segura para sua conta</Text>

      <View style={styles.inputContainer}>
        <View style={styles.inputIconContainer}>
          <Ionicons name="lock-closed" size={20} color="#8B5CF6" />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Senha (mín. 6 caracteres)"
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

      <View style={styles.passwordTips}>
        <Text style={styles.passwordTipsTitle}>Dicas para senha segura:</Text>
        <View style={styles.tipRow}>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
          <Text style={styles.tipText}>Pelo menos 6 caracteres</Text>
        </View>
        <View style={styles.tipRow}>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
          <Text style={styles.tipText}>Combine letras e números</Text>
        </View>
      </View>
    </View>
  );

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
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={handleBackToLogin}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.headerContent}>
              <View style={styles.logoContainer}>
                <View style={styles.logoBox}>
                  <Ionicons name="car-sport" size={28} color="white" />
                </View>
              </View>
              <Text style={styles.title}>Cadastro</Text>
              <Text style={styles.subtitle}>Junte-se à NALM GO</Text>
            </View>
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(currentStep / 3) * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>Etapa {currentStep} de 3</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <View style={styles.formCard}>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                {currentStep > 1 && (
                  <TouchableOpacity
                    style={styles.prevButton}
                    onPress={handlePrevStep}
                    disabled={loading}
                  >
                    <Ionicons name="arrow-back" size={20} color="#6B7280" />
                    <Text style={styles.prevButtonText}>Voltar</Text>
                  </TouchableOpacity>
                )}

                {currentStep < 3 ? (
                  <TouchableOpacity
                    style={[styles.nextButton, currentStep === 1 && styles.fullWidthButton]}
                    onPress={handleNextStep}
                    disabled={loading}
                  >
                    <Text style={styles.nextButtonText}>Próximo</Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.signUpButton, loading && styles.buttonDisabled]}
                    onPress={handleSignUp}
                    disabled={loading}
                  >
                    {loading ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator color="white" size="small" />
                        <Text style={styles.loadingText}>Criando conta...</Text>
                      </View>
                    ) : (
                      <View style={styles.buttonContent}>
                        <Text style={styles.signUpButtonText}>Criar Conta</Text>
                        <Ionicons name="checkmark" size={20} color="white" />
                      </View>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginQuestion}>Já tem uma conta?</Text>
              <TouchableOpacity onPress={handleBackToLogin} disabled={loading}>
                <Text style={styles.loginLink}>Entre aqui</Text>
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
    backgroundColor: "#10B981",
    paddingTop: 10,
    paddingBottom: 30,
    paddingHorizontal: 20,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: 15,
    left: 20,
    zIndex: 1,
    padding: 8,
  },
  headerContent: {
    alignItems: "center",
    marginTop: 10,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoBox: {
    width: 60,
    height: 60,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },

  // Progress
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: "center",
  },
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },

  // Form
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 20,
  },

  // Steps
  stepContainer: {
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  stepSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
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

  // Password Tips
  passwordTips: {
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  passwordTipsTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#166534",
    marginBottom: 8,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  tipText: {
    fontSize: 12,
    color: "#166534",
    marginLeft: 6,
  },

  // Buttons
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  prevButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flex: 0.4,
  },
  prevButtonText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flex: 0.55,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  fullWidthButton: {
    flex: 1,
  },
  signUpButton: {
    backgroundColor: "#8B5CF6",
    borderRadius: 12,
    paddingVertical: 16,
    flex: 1,
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
  signUpButtonText: {
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

  // Login Link
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  loginQuestion: {
    color: "#6B7280",
    fontSize: 16,
  },
  loginLink: {
    color: "#10B981",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 4,
  },
});
export default CadastroScreen;
