import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "../navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { Image } from "react-native";
import { uploadImage } from "../services/UploadImage";
import { atualizarImagemNoBanco } from "../services/updateImg";

export default function PerfilScreen() {
  const { userData, setUserData } = useUser();
  const navigation = useNavigation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const getDisplayName = (fullName) => {
    if (!fullName) return "Usuário";
    const names = fullName.split(" ");
    return names[0];
  };

  const handleLogout = () => {
    Alert.alert(
      "Confirmação",
      "Você realmente quer sair?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sair",
          style: "destructive",
          onPress: () => {
            setUserData(null);
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Carrega a imagem do usuário quando o componente monta
  useEffect(() => {
    if (userData?.imagem_url) {
      setSelectedImage(userData.imagem_url);
    }
  }, [userData]);

  const pickImage = async () => {
    try {
      // Solicita permissão para acessar a galeria
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão necessária",
          "Precisamos de acesso à sua galeria para escolher uma foto."
        );
        return;
      }

      // Abre a galeria
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Proporção quadrada
        quality: 0.8, // Qualidade boa mas não máxima para economizar espaço
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const localUri = result.assets[0].uri;
        console.log("📷 Imagem selecionada:", localUri);

        // Mostra a imagem local imediatamente para melhor UX
        setSelectedImage(localUri);
        setIsUploading(true);

        // Verifica se temos o ID do usuário
        if (!userData?.id) {
          Alert.alert(
            "Erro",
            "ID do usuário não encontrado. Faça login novamente."
          );
          setIsUploading(false);
          return;
        }

        console.log("📤 Fazendo upload para usuário ID:", userData.id);

        // Faz upload da imagem
        const uploadedUrl = await uploadImage(localUri, userData.id);

        if (uploadedUrl) {
          console.log("✅ Upload concluído! URL:", uploadedUrl);

          // Atualiza o estado local do usuário
          setUserData((prev) => ({
            ...prev,
            imagem_url: uploadedUrl,
          }));

          // Define a nova imagem
          setSelectedImage(uploadedUrl);

          Alert.alert("Sucesso!", "Foto de perfil atualizada com sucesso!");
        } else {
          console.log("❌ Erro no upload");
          // Volta para a imagem anterior em caso de erro
          setSelectedImage(userData?.imagem_url || null);
          Alert.alert(
            "Erro",
            "Não foi possível atualizar a foto. Tente novamente."
          );
        }
      }
    } catch (error) {
      console.error("❌ Erro ao selecionar/fazer upload da imagem:", error);
      setSelectedImage(userData?.imagem_url || null);
      Alert.alert(
        "Erro",
        "Ocorreu um erro ao processar a imagem. Tente novamente."
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4A5D23" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Perfil Principal */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <TouchableOpacity
                style={styles.avatar}
                onPress={pickImage}
                disabled={isUploading}
              >
                {selectedImage ? (
                  <Image
                    source={{ uri: selectedImage }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Ionicons name="person" size={40} color="white" />
                )}

                {/* Indicador de upload */}
                {isUploading && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator size="small" color="white" />
                  </View>
                )}

                {/* Ícone de câmera para indicar que é clicável */}
                <View style={styles.cameraIcon}>
                  <Ionicons name="camera" size={16} color="white" />
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {userData ? getDisplayName(userData.nome) : "Usuário"}
              </Text>
              <Text style={styles.profileSubtitle}>Motorista Qualificado</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Ionicons name="star" size={16} color="#FFD700" />
                <Ionicons name="star" size={16} color="#FFD700" />
                <Ionicons name="star" size={16} color="#FFD700" />
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>4.9 (127 reviews)</Text>
              </View>
            </View>
          </View>

          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark" size={16} color="white" />
            <Text style={styles.verifiedText}>Motorista Verificado</Text>
          </View>
        </View>

        {/* Estatísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="document-outline" size={24} color="#666" />
              </View>
              <Text style={styles.statNumber}>156</Text>
              <Text style={styles.statLabel}>Trabalhos completos</Text>
              <Text style={styles.statSubLabel}>+12 neste mês</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="star" size={24} color="#FFD700" />
              </View>
              <Text style={styles.statNumber}>4.9</Text>
              <Text style={styles.statLabel}>Média de Avaliação</Text>
              <Text style={styles.statSubLabel}>+0.1 neste mês</Text>
            </View>
          </View>

          <View style={styles.statRow}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="car" size={24} color="#4A5D23" />
              </View>
              <Text style={styles.statNumber}>497187.6</Text>
              <Text style={styles.statLabel}>Km rodadas</Text>
              <Text style={styles.statSubLabel}>+9561,3 neste mês</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="time-outline" size={24} color="#FF6B35" />
              </View>
              <Text style={styles.statNumber}>6400</Text>
              <Text style={styles.statLabel}>Horas trabalhadas</Text>
              <Text style={styles.statSubLabel}>+48 neste mês</Text>
            </View>
          </View>
        </View>

        {/* Informações do Usuário */}
        <View style={styles.userInfoContainer}>
          <Text style={styles.sectionTitle}>Informações Pessoais</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nome Completo</Text>
                <Text style={styles.infoValue}>
                  {userData ? userData.nome : "Não informado"}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="at-outline" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Usuário</Text>
                <Text style={styles.infoValue}>
                  {userData ? userData.usuario : "Não informado"}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>
                  {userData ? userData.email : "Não informado"}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="card-outline" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>CPF</Text>
                <Text style={styles.infoValue}>
                  {userData && userData.cpf
                    ? userData.cpf.replace(
                        /(\d{3})(\d{3})(\d{3})(\d{2})/,
                        "$1.$2.$3-$4"
                      )
                    : "Não informado"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Ganhos do Mês */}
        <View style={styles.earningsContainer}>
          <View style={styles.earningsCard}>
            <Text style={styles.earningsTitle}>Ganhos Totais</Text>
            <Text style={styles.earningsAmount}>R$21.696,04</Text>
            <Text style={styles.earningsMonth}>Neste mês</Text>
          </View>
        </View>

        {/* Ações do Perfil */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="settings-outline" size={24} color="#4A5D23" />
            <Text style={styles.actionText}>Configurações</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="help-circle-outline" size={24} color="#4A5D23" />
            <Text style={styles.actionText}>Ajuda</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#FF6B35" />
            <Text style={[styles.actionText, { color: "#FF6B35" }]}>Sair</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#4A5D23",
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    padding: 20,
  },
  profileCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  avatarContainer: {
    marginRight: 15,
    position: "relative",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FF6B35",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: "#4A5D23",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  profileSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 12,
    color: "#666",
  },
  verifiedBadge: {
    backgroundColor: "#4A5D23",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
  },
  verifiedText: {
    color: "white",
    marginLeft: 5,
    fontWeight: "bold",
  },
  statsContainer: {
    marginBottom: 30,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: -5,
    marginVertical: 5,
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    flex: 1,
    marginHorizontal: 10,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statIcon: {
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  statSubLabel: {
    fontSize: 10,
    color: "#4A5D23",
    textAlign: "center",
  },
  earningsContainer: {
    marginBottom: 20,
  },
  earningsCard: {
    backgroundColor: "#4A5D23",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  earningsTitle: {
    color: "white",
    fontSize: 14,
    marginBottom: 10,
  },
  earningsAmount: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 5,
  },
  earningsMonth: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
  },
  userInfoContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoContent: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  actionsContainer: {
    marginBottom: 30,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: "white",
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
});
