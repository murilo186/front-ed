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

import ApiService from "../services/apiService";
import { useUser } from "../navigation/AppNavigator";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const { setUserData } = useUser();

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert("Erro", "Por favor, preencha todos os campos");
      return;
    }

    setLoading(true);

    try {
      const response = await ApiService.login(email, senha);

      Alert.alert("Sucesso", response.message);
      console.log(
        "👤 Dados completos do usuário:",
        JSON.stringify(response.usuario, null, 2)
      );

      // Define os dados do usuário no contexto global
      setUserData(response.usuario);

      // Navega para a tela principal
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
      "Em breve",
      "Funcionalidade de recuperação de senha será implementada em breve!"
    );
  };

  const handleSignUp = () => {
    navigation.navigate("Cadastro");
  };

  const handleTouchID = () => {
    Alert.alert("Em breve", "Touch ID será implementado em breve!");
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

          {/* Tab Motorista */}
          <View style={styles.tabContainer}>
            <View style={styles.tab}>
              <Text style={styles.tabText}>Página do Motorista</Text>
            </View>
            <View style={styles.blueBox}>
              <Text style={styles.blueBoxText}>35$ • 45 Hug</Text>
            </View>
          </View>

          {/* Formulário */}
          <View style={styles.form}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Entre com seu email"
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
              ref={(input) => {
                this.senhaInput = input;
              }}
              style={styles.input}
              placeholder="Entre com sua senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
              editable={!loading}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.loginButtonText}>Entrar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={handleForgotPassword} disabled={loading}>
              <Text style={styles.forgotPassword}>Esqueceu sua senha?</Text>
            </TouchableOpacity>

            {/* Nova seção de cadastro */}
            <TouchableOpacity
              onPress={handleSignUp}
              style={styles.signUpContainer}
              disabled={loading}
            >
              <Text style={styles.signUpText}>
                Não tem uma conta ainda? cadastre-se
              </Text>
            </TouchableOpacity>

            <Text style={styles.orText}>or</Text>

            {/* Touch ID */}
            <TouchableOpacity
              style={styles.touchIdContainer}
              onPress={handleTouchID}
              disabled={loading}
            >
              <View style={styles.touchIdIcon}>
                <Text style={styles.touchIdEmoji}>🔒</Text>
              </View>
              <Text style={styles.touchIdText}>Use Touch ID</Text>
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
    marginBottom: 10,
  },
  tabText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  blueBox: {
    backgroundColor: "#4A90E2",
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  blueBoxText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  form: {
    flex: 1,
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
  loginButton: {
    backgroundColor: "#6B7B3A", // Verde oliva
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 15,
  },
  loginButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  forgotPassword: {
    color: "#CD853F",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15,
  },
  signUpContainer: {
    marginBottom: 20,
  },
  signUpText: {
    color: "#333",
    fontSize: 16,
    textAlign: "center",
  },
  orText: {
    color: "#999",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
  },
  touchIdContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  touchIdIcon: {
    width: 50,
    height: 50,
    backgroundColor: "#DDD",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  touchIdEmoji: {
    fontSize: 20,
  },
  touchIdText: {
    color: "#666",
    fontSize: 14,
  },
});

export default LoginScreen;
