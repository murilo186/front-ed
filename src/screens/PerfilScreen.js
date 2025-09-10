import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar,
  StyleSheet, Alert, ActivityIndicator, Modal, RefreshControl, Image
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "../navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { uploadImage } from "../services/UploadImage";
import apiService from "../services/apiService";

export default function PerfilScreen() {
  const { userData, setUserData } = useUser();
  const navigation = useNavigation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [showDocuments, setShowDocuments] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [convitesPendentes, setConvitesPendentes] = useState([]);
  const [loadingConvites, setLoadingConvites] = useState(false);


  useEffect(() => {
  console.log("=== DEBUG MOTORISTA ===");
  console.log("ID do motorista:", userData?.id);
  console.log("Código do motorista:", userData?.codigo);
  console.log("Email do motorista:", userData?.email);
  console.log("=======================");
  
  if (userData?.imagem_url) setSelectedImage(userData.imagem_url);
  if (userData?.id) carregarConvites();
}, [userData]);

  useEffect(() => {
    if (userData?.imagem_url) setSelectedImage(userData.imagem_url);
    if (userData?.id) carregarConvites();
  }, [userData]);

  const carregarConvites = async () => {
    if (!userData?.id) return;
    try {
      setLoadingConvites(true);
      const response = await apiService.buscarConvitesMotorista(userData.id);
      if (response.success) setConvitesPendentes(response.convites);
    } catch (error) {
      console.error('Erro ao carregar convites:', error);
    } finally {
      setLoadingConvites(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarConvites();
    setRefreshing(false);
  };

  const getDisplayName = (fullName) => {
    if (!fullName) return "Usuário";
    const names = fullName.split(" ");
    return names.length > 1 ? `${names[0]} ${names[1]}` : names[0];
  };

  const toggleAvailability = () => setIsAvailable(!isAvailable);

  const handleLogout = () => {
    Alert.alert("Confirmação", "Você realmente quer sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair", style: "destructive", onPress: () => {
          setUserData(null);
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        }
      }
    ]);
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permissão necessária", "Precisamos de acesso à sua galeria para escolher uma foto.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, aspect: [1, 1], quality: 0.8
      });

      if (!result.canceled && result.assets?.length > 0) {
        const localUri = result.assets[0].uri;
        setSelectedImage(localUri);
        setIsUploading(true);

        if (!userData?.id) {
          Alert.alert("Erro", "ID do usuário não encontrado. Faça login novamente.");
          setIsUploading(false);
          return;
        }

        const uploadedUrl = await uploadImage(localUri, userData.id);
        if (uploadedUrl) {
          setUserData(prev => ({ ...prev, imagem_url: uploadedUrl }));
          setSelectedImage(uploadedUrl);
          Alert.alert("Sucesso!", "Foto de perfil atualizada com sucesso!");
        } else {
          setSelectedImage(userData?.imagem_url || null);
          Alert.alert("Erro", "Não foi possível atualizar a foto. Tente novamente.");
        }
      }
    } catch (error) {
      console.error("Erro ao selecionar/fazer upload da imagem:", error);
      setSelectedImage(userData?.imagem_url || null);
      Alert.alert("Erro", "Ocorreu um erro ao processar a imagem. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  const copyVinculationCode = () => {
    const code = userData?.codigo || "N/A";
    Alert.alert("Código de Vinculação", `Seu código: ${code}\n\nCompartilhe este código com a empresa para se vincular!`,
      [{ text: "Copiar", onPress: () => console.log("Código copiado") }, { text: "OK" }]
    );
  };

  const aceitarConvite = async (convite) => {
    Alert.alert("Aceitar Convite", `Deseja se juntar à equipe da ${convite.nome_empresa} como motorista agregado?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Aceitar", onPress: async () => {
          try {
            const response = await apiService.aceitarConvite(convite.id, userData.id);
            if (response.success) {
              Alert.alert("Sucesso!", response.message);
              await carregarConvites();
            } else {
              Alert.alert("Erro", response.error || "Erro ao aceitar convite");
            }
          } catch (error) {
            console.error("Erro ao aceitar convite:", error);
            Alert.alert("Erro", "Não foi possível aceitar o convite. Tente novamente.");
          }
        }
      }
    ]);
  };

  const recusarConvite = async (conviteId) => {
    Alert.alert("Recusar Convite", "Tem certeza que deseja recusar este convite?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Recusar", style: "destructive", onPress: async () => {
          try {
            const response = await apiService.rejeitarConvite(conviteId, userData.id);
            if (response.success) {
              Alert.alert("Convite recusado", response.message);
              await carregarConvites();
            } else {
              Alert.alert("Erro", response.error || "Erro ao recusar convite");
            }
          } catch (error) {
            console.error("Erro ao recusar convite:", error);
            Alert.alert("Erro", "Não foi possível recusar o convite. Tente novamente.");
          }
        }
      }
    ]);
  };

  const DocumentsModal = () => (
    <Modal visible={showDocuments} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowDocuments(false)}>
            <Ionicons name="close" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Documentos</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView style={styles.modalContent}>
          <Text style={styles.modalSubtitle}>Envie seus documentos para verificação</Text>
          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Salvar Alterações</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#8B5CF6" barStyle="light-content" />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.profileHeaderSection}>
            <TouchableOpacity style={styles.avatarContainer} onPress={pickImage} disabled={isUploading}>
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={32} color="#8B5CF6" />
                </View>
              )}
              {isUploading && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="small" color="white" />
                </View>
              )}
              <View style={styles.cameraIcon}>
                <Ionicons name="camera" size={14} color="white" />
              </View>
            </TouchableOpacity>

            <View style={styles.profileHeaderInfo}>
              <Text style={styles.profileName}>
                {userData ? getDisplayName(userData.nome) : "Usuário"}
              </Text>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="white" />
                <Text style={styles.verifiedText}>Motorista Verificado</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.statusButton, isAvailable ? styles.available : styles.unavailable]}
            onPress={toggleAvailability}
          >
            <View style={[styles.statusDot, isAvailable ? styles.dotAvailable : styles.dotUnavailable]} />
            <Text style={[styles.statusText, isAvailable ? styles.statusAvailable : styles.statusUnavailable]}>
              {isAvailable ? "Disponível" : "Indisponível"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        
        {/* Código de Vinculação */}
        <View style={styles.vinculationCard}>
          <View style={styles.vinculationHeader}>
            <View style={styles.vinculationIconContainer}>
              <Ionicons name="link" size={24} color="white" />
            </View>
            <View style={styles.vinculationInfo}>
              <Text style={styles.vinculationTitle}>Código de Vinculação</Text>
              <Text style={styles.vinculationSubtitle}>Compartilhe com empresas</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.codeButton} onPress={copyVinculationCode}>
            <Text style={styles.codeText}>{userData?.codigo || "N/A"}</Text>
            <Ionicons name="copy" size={20} color="#8B5CF6" />
          </TouchableOpacity>
        </View>

        {/* Convites Pendentes */}
        {convitesPendentes.length > 0 && (
          <View style={styles.convitesCard}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <Ionicons name="mail" size={20} color="white" />
              </View>
              <Text style={styles.cardTitle}>Convites Pendentes</Text>
              {loadingConvites && <ActivityIndicator size="small" color="#8B5CF6" />}
            </View>
            {convitesPendentes.map((convite) => (
              <View key={convite.id} style={styles.conviteItem}>
                <View style={styles.conviteInfo}>
                  <Text style={styles.conviteEmpresa}>{convite.nome_empresa}</Text>
                  <Text style={styles.conviteTipo}>Convite para motorista agregado</Text>
                  <Text style={styles.conviteData}>
                    Recebido em {new Date(convite.data_convite).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
                <View style={styles.conviteActions}>
                  <TouchableOpacity style={styles.conviteRecusar} onPress={() => recusarConvite(convite.id)}>
                    <Ionicons name="close" size={16} color="#1F2937" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.conviteAceitar} onPress={() => aceitarConvite(convite)}>
                    <Ionicons name="checkmark" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Empresa Vinculada */}
        {userData?.empresa_id && (
          <View style={styles.companyCard}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <Ionicons name="business" size={20} color="white" />
              </View>
              <Text style={styles.cardTitle}>Empresa Vinculada</Text>
            </View>
            <View style={styles.companyInfo}>
              <View style={styles.companyLogo}>
                <Text style={styles.companyLogoText}>EM</Text>
              </View>
              <View style={styles.companyDetails}>
                <Text style={styles.companyName}>Empresa Vinculada</Text>
                <View style={styles.companyStatusContainer}>
                  <View style={styles.companyStatusDot} />
                  <Text style={styles.companyStatus}>Motorista Agregado</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Informações Pessoais */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="person" size={20} color="white" />
            </View>
            <Text style={styles.cardTitle}>Informações Pessoais</Text>
          </View>
          <View style={styles.infoList}>
            {[
              ['Nome Completo', userData?.nome || "Não informado"],
              ['Email', userData?.email || "Não informado"],
              ['CPF', userData?.cpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") || "Não informado"],
              ['Usuário', userData?.usuario || "Não informado"],
              ['Código Único', userData?.codigo || "Não informado"]
            ].map(([label, value], index) => (
              <View key={index} style={styles.infoItem}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Ações */}
        <View style={styles.actionsContainer}>
          {[
            { icon: "document-text", text: "Documentos", onPress: () => setShowDocuments(true) },
            { icon: "settings", text: "Configurações", onPress: () => {} },
            { icon: "help-circle", text: "Ajuda e Suporte", onPress: () => {} },
            { icon: "log-out", text: "Sair da Conta", onPress: handleLogout, isLogout: true }
          ].map((action, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.actionButton, action.isLogout && styles.logoutButton]} 
              onPress={action.onPress}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name={action.icon} size={22} color={action.isLogout ? "#1F2937" : "#8B5CF6"} />
              </View>
              <Text style={[styles.actionText, action.isLogout && styles.logoutText]}>{action.text}</Text>
              <Ionicons name="chevron-forward" size={18} color="#6B7280" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <DocumentsModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  
  // Header
  header: { backgroundColor: "#8B5CF6", paddingTop: 10, paddingBottom: 25, paddingHorizontal: 20 },
  headerContent: { alignItems: "center" },
  profileHeaderSection: { flexDirection: "row", alignItems: "center", marginBottom: 20, width: "100%" },
  
  // Avatar
  avatarContainer: { position: "relative", marginRight: 15 },
  avatarImage: { width: 70, height: 70, borderRadius: 35, borderWidth: 3, borderColor: "white" },
  avatarPlaceholder: { 
    width: 70, height: 70, borderRadius: 35, backgroundColor: "white", 
    justifyContent: "center", alignItems: "center", borderWidth: 3, borderColor: "white" 
  },
  uploadingOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0, 
    backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 35, justifyContent: "center", alignItems: "center"
  },
  cameraIcon: {
    position: "absolute", bottom: 2, right: 2, backgroundColor: "#8B5CF6", 
    borderRadius: 10, width: 20, height: 20, justifyContent: "center", alignItems: "center", 
    borderWidth: 2, borderColor: "white"
  },
  
  // Profile Info
  profileHeaderInfo: { flex: 1 },
  profileName: { fontSize: 22, fontWeight: "bold", color: "white", marginBottom: 8 },
  verifiedBadge: { flexDirection: "row", alignItems: "center" },
  verifiedText: { color: "white", marginLeft: 5, fontSize: 14, fontWeight: "500" },
  
  // Status
  statusButton: { 
    flexDirection: "row", alignItems: "center", paddingHorizontal: 16, 
    paddingVertical: 8, borderRadius: 20, borderWidth: 1 
  },
  available: { backgroundColor: "rgba(139, 92, 246, 0.2)", borderColor: "#8B5CF6" },
  unavailable: { backgroundColor: "rgba(31, 41, 55, 0.2)", borderColor: "#1F2937" },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  dotAvailable: { backgroundColor: "#8B5CF6" },
  dotUnavailable: { backgroundColor: "#1F2937" },
  statusText: { fontSize: 14, fontWeight: "600" },
  statusAvailable: { color: "#8B5CF6" },
  statusUnavailable: { color: "#1F2937" },
  
  // Content
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  
  // Cards
  vinculationCard: {
    backgroundColor: "white", borderRadius: 16, padding: 20, marginBottom: 16,
    shadowColor: "#8B5CF6", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15,
    shadowRadius: 8, elevation: 8, borderLeftWidth: 4, borderLeftColor: "#8B5CF6"
  },
  convitesCard: {
    backgroundColor: "white", borderRadius: 16, padding: 20, marginBottom: 16,
    shadowColor: "#8B5CF6", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1,
    shadowRadius: 8, elevation: 6, borderLeftWidth: 4, borderLeftColor: "#8B5CF6"
  },
  companyCard: {
    backgroundColor: "white", borderRadius: 16, padding: 20, marginBottom: 16,
    shadowColor: "#8B5CF6", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1,
    shadowRadius: 8, elevation: 6, borderLeftWidth: 4, borderLeftColor: "#8B5CF6"
  },
  infoCard: {
    backgroundColor: "white", borderRadius: 16, padding: 20, marginBottom: 16,
    shadowColor: "#8B5CF6", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1,
    shadowRadius: 8, elevation: 6, borderLeftWidth: 4, borderLeftColor: "#8B5CF6"
  },
  
  // Headers
  vinculationHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  vinculationIconContainer: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: "#8B5CF6",
    justifyContent: "center", alignItems: "center", marginRight: 12
  },
  vinculationInfo: { flex: 1 },
  vinculationTitle: { fontSize: 16, fontWeight: "bold", color: "#1F2937", marginBottom: 2 },
  vinculationSubtitle: { fontSize: 12, color: "#6B7280" },
  
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  iconContainer: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: "#8B5CF6",
    justifyContent: "center", alignItems: "center", marginRight: 12
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#1F2937", flex: 1 },
  
  // Code Button
  codeButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 12, paddingHorizontal: 16, backgroundColor: "#F3F4F6",
    borderRadius: 12, borderWidth: 2, borderColor: "#E5E7EB"
  },
  codeText: { fontSize: 18, fontWeight: "bold", color: "#8B5CF6", letterSpacing: 2 },
  
  // Convites
  conviteItem: {
    flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 16,
    backgroundColor: "#F3F4F6", borderRadius: 12, marginBottom: 12
  },
  conviteInfo: { flex: 1 },
  conviteEmpresa: { fontSize: 16, fontWeight: "600", color: "#1F2937", marginBottom: 4 },
  conviteTipo: { fontSize: 14, color: "#6B7280", marginBottom: 2 },
  conviteData: { fontSize: 12, color: "#6B7280" },
  conviteActions: { flexDirection: "row", gap: 8 },
  conviteRecusar: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: "#F3F4F6",
    justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#E5E7EB"
  },
  conviteAceitar: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: "#8B5CF6",
    justifyContent: "center", alignItems: "center"
  },
  
  // Company Info
  companyInfo: { flexDirection: "row", alignItems: "center" },
  companyLogo: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: "#8B5CF6",
    justifyContent: "center", alignItems: "center", marginRight: 16
  },
  companyLogoText: { color: "white", fontSize: 16, fontWeight: "bold" },
  companyDetails: { flex: 1 },
  companyName: { fontSize: 16, fontWeight: "600", color: "#1F2937", marginBottom: 4 },
  companyStatusContainer: { flexDirection: "row", alignItems: "center" },
  companyStatusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#8B5CF6", marginRight: 6 },
  companyStatus: { fontSize: 12, color: "#8B5CF6", fontWeight: "500" },
  
  // Info List
  infoList: { gap: 12 },
  infoItem: { paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  infoLabel: {
    fontSize: 12, color: "#6B7280", marginBottom: 4, textTransform: "uppercase",
    letterSpacing: 0.5, fontWeight: "600"
  },
  infoValue: { fontSize: 16, color: "#1F2937", fontWeight: "500" },
  
  // Actions
  actionsContainer: { marginTop: 8 },
  actionButton: {
    flexDirection: "row", alignItems: "center", paddingVertical: 16, paddingHorizontal: 16,
    backgroundColor: "white", borderRadius: 12, marginBottom: 8, shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
    elevation: 3, borderWidth: 1, borderColor: "#F3F4F6"
  },
  actionIconContainer: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: "#F8FAFC",
    justifyContent: "center", alignItems: "center", marginRight: 12
  },
  actionText: { flex: 1, fontSize: 16, fontWeight: "500", color: "#1F2937" },
  logoutButton: { marginTop: 8, borderColor: "#FEE2E2" },
  logoutText: { color: "#1F2937" },
  
  // Modal
  modalContainer: { flex: 1, backgroundColor: "white" },
  modalHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#E5E7EB"
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#1F2937" },
  modalContent: { flex: 1, padding: 20 },
  modalSubtitle: { fontSize: 14, color: "#6B7280", marginBottom: 24, textAlign: "center" },
  saveButton: { backgroundColor: "#8B5CF6", borderRadius: 12, paddingVertical: 16, alignItems: "center" },
  saveButtonText: { color: "white", fontSize: 16, fontWeight: "600" },
  bottomSpacing: { height: 40 }
});