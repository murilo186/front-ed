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
import ApiService from "../services/apiService";

const CadastroScreen = ({ navigation }) => {
  const [nome, setNome] = useState("");
  const [usuario, setUsuario] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const formatCPF = (text) => {
    // Remove tudo que não é dígito
    const cleanText = text.replace(/\D/g, "");

    // Aplica a máscara XXX.XXX.XXX-XX
    if (cleanText.length <= 11) {
      let formatted = cleanText;
      if (cleanText.length > 3) {
        formatted = cleanText.replace(/(\d{3})(\d)/, "$1.$2");
      }
      if (cleanText.length > 6) {
        formatted = cleanText.replace(/(\d{3})(\d{3})(\d)/, "$1.$2.$3");
      }
      if (cleanText.length > 9) {
        formatted = cleanText.replace(
          /(\d{3})(\d{3})(\d{3})(\d)/,
          "$1.$2.$3-$4"
        );
      }
      setCpf(formatted);
    }
  };

  const handleSignUp = async () => {
    if (!nome || !usuario || !cpf || !email || !senha) {
      Alert.alert("Erro", "Por favor, preencha todos os campos");
      return;
    }

    // Validação básica de CPF (11 dígitos)
    const cpfNumbers = cpf.replace(/\D/g, "");
    if (cpfNumbers.length !== 11) {
      Alert.alert("Erro", "CPF deve conter 11 dígitos");
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Erro", "Digite um email válido");
      return;
    }

    // Validação de senha
    if (senha.length < 6) {
      Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres");
      return;
    }

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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoBox}>
              <Text style={styles.logoIcon}>🚛</Text>
            </View>
          </View>

          {/* Título */}
          <Text style={styles.title}>NALM GO!</Text>
          <Text style={styles.subtitle}>Transporte Simplificado</Text>

          {/* Tab Cadastro */}
          <View style={styles.tabContainer}>
            <View style={styles.tab}>
              <Text style={styles.tabText}>Criar Conta</Text>
            </View>
          </View>

          {/* Formulário */}
          <View style={styles.form}>
            <Text style={styles.label}>Nome Completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu nome completo"
              value={nome}
              onChangeText={setNome}
              autoCapitalize="words"
              editable={!loading}
              returnKeyType="next"
              onSubmitEditing={() => this.usuarioInput.focus()}
              blurOnSubmit={false}
            />

            <Text style={styles.label}>Usuário</Text>
            <TextInput
              ref={(input) => { this.usuarioInput = input; }}
              style={styles.input}
              placeholder="Digite seu nome de usuário"
              value={usuario}
              onChangeText={setUsuario}
              autoCapitalize="none"
              editable={!loading}
              returnKeyType="next"
              onSubmitEditing={() => this.cpfInput.focus()}
              blurOnSubmit={false}
            />

            <Text style={styles.label}>CPF</Text>
            <TextInput
              ref={(input) => { this.cpfInput = input; }}
              style={styles.input}
              placeholder="000.000.000-00"
              value={cpf}
              onChangeText={formatCPF}
              keyboardType="numeric"
              maxLength={14}
              editable={!loading}
              returnKeyType="next"
              onSubmitEditing={() => this.emailInput.focus()}
              blurOnSubmit={false}
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              ref={(input) => { this.emailInput = input; }}
              style={styles.input}
              placeholder="Digite seu email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
              returnKeyType="next"
              onSubmitEditing={() => this.senhaInput.focus()}
              blurOnSubmit={false}
            />

            <Text style={styles.label}>Senha</Text>
            <TextInput
              ref={(input) => { this.senhaInput = input; }}
              style={styles.input}
              placeholder="Digite sua senha (mín. 6 caracteres)"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
              editable={!loading}
              returnKeyType="done"
              onSubmitEditing={handleSignUp}
            />

            <TouchableOpacity
              style={[styles.signUpButton, loading && styles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.signUpButtonText}>Criar Conta</Text>
              )}
            </TouchableOpacity>

            {/* Link para voltar ao login */}
            <TouchableOpacity
              onPress={handleBackToLogin}
              style={styles.loginContainer}
              disabled={loading}
            >
              <Text style={styles.loginText}>Já tem uma conta? Entre aqui</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5DC", // Cor bege/creme
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingTop: 60,
    paddingBottom: 30,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoBox: {
    width: 80,
    height: 80,
    backgroundColor: "#6B7B3A", // Verde oliva
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  logoIcon: {
    fontSize: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 40,
  },
  tabContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  tab: {
    backgroundColor: "#CD853F", // Marrom/laranja
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  tabText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  form: {
    flex: 1,
    paddingBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  signUpButton: {
    backgroundColor: "#6B7B3A", // Verde oliva
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 15,
  },
  signUpButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loginContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  loginText: {
    color: "#CD853F",
    fontSize: 16,
    textAlign: "center",
  },
});

export default CadastroScreen;