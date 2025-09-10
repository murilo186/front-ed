import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "../navigation/AppNavigator";
import apiService from "../services/apiService";

export default function DashBoardScreen() {
  const { userData, setUserData } = useUser();
  const [currentDate, setCurrentDate] = useState("");
  const [greeting, setGreeting] = useState("");
  const [motoristaStatus, setMotoristaStatus] = useState("livre"); // livre, indisponivel, em-frete
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    const today = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    setCurrentDate(today.toLocaleDateString("pt-BR", options));

    // Definir saudação baseada na hora
    const hour = today.getHours();
    if (hour < 12) {
      setGreeting("Bom dia");
    } else if (hour < 18) {
      setGreeting("Boa tarde");
    } else {
      setGreeting("Boa noite");
    }

    // Carregar status atual do motorista
    if (userData?.status_disponibilidade) {
      setMotoristaStatus(userData.status_disponibilidade);
    }
  }, [userData]);

  const getDisplayName = (fullName) => {
    if (!fullName) return "Motorista";
    const names = fullName.split(" ");
    if (names.length >= 2) {
      return `${names[0]} ${names[1]}`;
    }
    return names[0];
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "livre":
        return {
          label: "Disponível",
          color: "#10B981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          icon: "checkmark-circle",
          description:
            "Você está visível para empresas que procuram motoristas",
        };
      case "indisponivel":
        return {
          label: "Indisponível",
          color: "#6B7280",
          backgroundColor: "rgba(107, 114, 128, 0.1)",
          icon: "pause-circle",
          description: "Você não receberá ofertas de frete neste momento",
        };
      case "em-frete":
        return {
          label: "Em Serviço",
          color: "#F59E0B",
          backgroundColor: "rgba(245, 158, 11, 0.1)",
          icon: "car",
          description: "Você está executando um frete no momento",
        };
      default:
        return {
          label: "Desconhecido",
          color: "#6B7280",
          backgroundColor: "rgba(107, 114, 128, 0.1)",
          icon: "help-circle",
          description: "Status desconhecido",
        };
    }
  };

  const alterarStatusMotorista = async () => {
    if (motoristaStatus === "em-frete") {
      Alert.alert(
        "Não é possível alterar",
        "Você está em serviço. O status será alterado automaticamente quando o frete for finalizado."
      );
      return;
    }

    const novoStatus = motoristaStatus === "livre" ? "indisponivel" : "livre";
    const statusInfo = getStatusInfo(novoStatus);

    Alert.alert(
      "Alterar Status",
      `Deseja alterar seu status para "${statusInfo.label}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            try {
              setIsUpdatingStatus(true);

              // Aqui você implementará a chamada para o backend
              // Por enquanto vamos simular a atualização
              console.log(
                `🔄 Alterando status de ${motoristaStatus} para ${novoStatus}`
              );

              // Chamada real para API
              const response = await fetch(
                `${apiService.getBaseURL()}/api/auth/motorista/${
                  userData.id
                }/status`,
                {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status_disponibilidade: novoStatus }),
                }
              );

              const data = await response.json();

              if (data.success) {
                setMotoristaStatus(novoStatus);
              } else {
                throw new Error(data.error || "Erro ao atualizar status");
              }
              // Atualizar dados do usuário
              setUserData((prev) => ({
                ...prev,
                status_disponibilidade: novoStatus,
              }));

              Alert.alert(
                "Status Atualizado",
                `Seu status foi alterado para "${statusInfo.label}"`
              );
            } catch (error) {
              console.error("❌ Erro ao alterar status:", error);
              Alert.alert(
                "Erro",
                "Não foi possível alterar o status. Tente novamente."
              );
            } finally {
              setIsUpdatingStatus(false);
            }
          },
        },
      ]
    );
  };

  const statusInfo = getStatusInfo(motoristaStatus);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#8B5CF6" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="car-sport" size={24} color="white" />
          <Text style={styles.appName}>NALM GO</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications" size={24} color="white" />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Saudação */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>{greeting},</Text>
          <Text style={styles.userName}>
            {userData ? getDisplayName(userData.nome) : "Carregando..."}
          </Text>
          <Text style={styles.dateText}>{currentDate}</Text>
        </View>

        {/* Status Card - ATUALIZADO */}
        <View
          style={[styles.statusCard, { borderLeftColor: statusInfo.color }]}
        >
          <View style={styles.statusHeader}>
            <View style={styles.statusIndicator}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: statusInfo.color },
                ]}
              />
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.label}
              </Text>
            </View>

            {motoristaStatus !== "em-frete" && (
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={alterarStatusMotorista}
                disabled={isUpdatingStatus}
              >
                <Text style={styles.toggleText}>
                  {isUpdatingStatus ? "Alterando..." : "Alterar Status"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.statusDescription}>{statusInfo.description}</Text>

          {motoristaStatus === "em-frete" && (
            <View style={styles.emFreteInfo}>
              <Ionicons name="information-circle" size={16} color="#F59E0B" />
              <Text style={styles.emFreteText}>
                Status controlado automaticamente durante fretes
              </Text>
            </View>
          )}
        </View>

        {/* Estatísticas Principais */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Suas Estatísticas</Text>

          <View style={styles.statsGrid}>
            {/* Fretes Completos */}
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              </View>
              <Text style={styles.statNumber}>
                {userData?.total_fretes_concluidos || 0}
              </Text>
              <Text style={styles.statLabel}>Fretes Completos</Text>
              <Text style={styles.statSubLabel}>Total realizado</Text>
            </View>

            {/* Avaliação */}
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="star" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.statNumber}>4.8</Text>
              <Text style={styles.statLabel}>Avaliação Média</Text>
              <Text style={styles.statSubLabel}>Baseado em avaliações</Text>
            </View>

            {/* Status Atual */}
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons
                  name={statusInfo.icon}
                  size={24}
                  color={statusInfo.color}
                />
              </View>
              <Text style={[styles.statNumber, { color: statusInfo.color }]}>
                {statusInfo.label}
              </Text>
              <Text style={styles.statLabel}>Status Atual</Text>
              <Text style={styles.statSubLabel}>Sua disponibilidade</Text>
            </View>

            {/* Empresa Vinculada */}
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="business" size={24} color="#8B5CF6" />
              </View>
              <Text style={styles.statNumber}>
                {userData?.empresa_id ? "Sim" : "Não"}
              </Text>
              <Text style={styles.statLabel}>Empresa Vinculada</Text>
              <Text style={styles.statSubLabel}>Status de vinculação</Text>
            </View>
          </View>
        </View>

        {/* Resumo Financeiro */}
        <View style={styles.financialSection}>
          <Text style={styles.sectionTitle}>Resumo Financeiro</Text>

          <View style={styles.financialCard}>
            <View style={styles.financialHeader}>
              <View style={styles.financialIconContainer}>
                <Ionicons name="wallet" size={28} color="white" />
              </View>
              <View style={styles.financialInfo}>
                <Text style={styles.financialTitle}>Ganhos Estimados</Text>
                <Text style={styles.financialAmount}>R$ 4.250,00</Text>
                <Text style={styles.financialPeriod}>Neste mês</Text>
              </View>
            </View>

            <View style={styles.financialDetails}>
              <View style={styles.financialItem}>
                <Text style={styles.financialItemLabel}>Ganho por frete</Text>
                <Text style={styles.financialItemValue}>R$ 354,17</Text>
              </View>
              <View style={styles.financialItem}>
                <Text style={styles.financialItemLabel}>Total de fretes</Text>
                <Text style={styles.financialItemValue}>
                  {userData?.total_fretes_concluidos || 0}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Ações Rápidas */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>

          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionCard}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="briefcase" size={24} color="#8B5CF6" />
              </View>
              <Text style={styles.quickActionText}>Ver Fretes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="document-text" size={24} color="#8B5CF6" />
              </View>
              <Text style={styles.quickActionText}>Histórico</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={alterarStatusMotorista}
              disabled={motoristaStatus === "em-frete"}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons
                  name={statusInfo.icon}
                  size={24}
                  color={motoristaStatus === "em-frete" ? "#6B7280" : "#8B5CF6"}
                />
              </View>
              <Text
                style={[
                  styles.quickActionText,
                  motoristaStatus === "em-frete" && { color: "#6B7280" },
                ]}
              >
                {motoristaStatus === "em-frete" ? "Em Serviço" : "Alt. Status"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="person" size={24} color="#8B5CF6" />
              </View>
              <Text style={styles.quickActionText}>Perfil</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Trabalho Ativo (se houver) */}
        {motoristaStatus === "em-frete" && (
          <View style={styles.activeJobSection}>
            <Text style={styles.sectionTitle}>Trabalho Atual</Text>

            <View style={styles.activeJobCard}>
              <View style={styles.jobHeader}>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>Em Andamento</Text>
                </View>
                <Text style={styles.jobId}>#FR-2024-0123</Text>
              </View>

              <Text style={styles.jobTitle}>Frete em Execução</Text>

              <View style={styles.locationContainer}>
                <Ionicons name="location" size={16} color="#6B7280" />
                <Text style={styles.locationText}>Santos → São Paulo</Text>
              </View>

              <View style={styles.progressContainer}>
                <Text style={styles.progressLabel}>Progresso</Text>
                <Text style={styles.progressPercentage}>65%</Text>
              </View>

              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: "65%" }]} />
              </View>

              <TouchableOpacity style={styles.continueButton}>
                <Text style={styles.continueButtonText}>Ver Detalhes</Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Espaçamento final */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  // Header
  header: {
    backgroundColor: "#8B5CF6",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  appName: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  notificationButton: {
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },

  // Content
  content: {
    flex: 1,
    padding: 20,
  },

  // Saudação
  greetingContainer: {
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: "#6B7280",
  },

  // Status Card - ATUALIZADO
  statusCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderLeftWidth: 4,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
  },
  toggleButton: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  toggleText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  statusDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  emFreteInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    padding: 8,
    borderRadius: 8,
  },
  emFreteText: {
    marginLeft: 6,
    fontSize: 12,
    color: "#92400E",
    flex: 1,
  },

  // Seções
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
  },

  // Estatísticas
  statsSection: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    width: "48%",
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 2,
  },
  statSubLabel: {
    fontSize: 10,
    color: "#8B5CF6",
    textAlign: "center",
    fontWeight: "500",
  },

  // Financeiro
  financialSection: {
    marginBottom: 24,
  },
  financialCard: {
    backgroundColor: "#8B5CF6",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  financialHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  financialIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  financialInfo: {
    flex: 1,
  },
  financialTitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginBottom: 4,
  },
  financialAmount: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 2,
  },
  financialPeriod: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
  },
  financialDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  financialItem: {
    flex: 1,
  },
  financialItemLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginBottom: 4,
  },
  financialItemValue: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  // Ações Rápidas
  quickActionsSection: {
    marginBottom: 24,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickActionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    width: "48%",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: "#1F2937",
    fontWeight: "500",
    textAlign: "center",
  },

  // Trabalho Ativo
  activeJobSection: {
    marginBottom: 24,
  },
  activeJobCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  activeBadge: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  jobId: {
    color: "#6B7280",
    fontSize: 12,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  locationText: {
    marginLeft: 8,
    color: "#6B7280",
    fontSize: 14,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    color: "#6B7280",
    fontSize: 14,
  },
  progressPercentage: {
    color: "#8B5CF6",
    fontSize: 14,
    fontWeight: "bold",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    marginBottom: 16,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#8B5CF6",
    borderRadius: 3,
  },
  continueButton: {
    backgroundColor: "#8B5CF6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
  },
  continueButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },

  bottomSpacing: {
    height: 40,
  },
});
