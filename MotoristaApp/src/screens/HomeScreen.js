import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "../navigation/AppNavigator";

export default function HomeScreen() {
  const { userData } = useUser(); // ✅ Pegando do contexto
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const today = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    setCurrentDate(today.toLocaleDateString("pt-BR", options));
  }, []);

  const getDisplayName = (fullName) => {
    if (!fullName) return "Usuário";
    const names = fullName.split(" ");
    if (names.length >= 2) {
      return `${names[0]} ${names[1]}`;
    }
    return names[0];
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4A5D23" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="car" size={24} color="white" />
          <Text style={styles.appName}>NALM GO!</Text>
        </View>
        <Ionicons name="notifications-outline" size={24} color="white" />
      </View>

      <ScrollView style={styles.content}>
        {/* Saudação */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>Good morning,</Text>
          <Text style={styles.userName}>
            {userData ? getDisplayName(userData.nome) : "Carregando..."}
          </Text>
          <Text style={styles.dateText}>{currentDate}</Text>
        </View>

        {/* Card de Trabalho Ativo */}
        <View style={styles.activeJobCard}>
          <View style={styles.jobHeader}>
            <View style={styles.activebadge}>
              <Text style={styles.activeBadgeText}>Ativo</Text>
            </View>
            <Text style={styles.jobId}>#MV-2025-0456</Text>
          </View>

          <Text style={styles.jobTitle}>Mudança Residencial</Text>

          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.locationText}>De: Cubatão/SP</Text>
          </View>

          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.locationText}>Para: Caraguatatuba/SP</Text>
          </View>

          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressPercentage}>71%</Text>
          </View>

          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "71%" }]} />
          </View>

          <View style={styles.jobActions}>
            <TouchableOpacity style={styles.continueButton}>
              <Text style={styles.continueButtonText}>
                Continuar o Trabalho
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.detailsButton}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color="#4A5D23"
              />
              <Text style={styles.detailsButtonText}>Detalhes</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Estatísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Transportes Feitos na Semana</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={20} color="#FFD700" />
              <Text style={styles.statNumber}>4.9</Text>
            </View>
            <Text style={styles.statLabel}>Média de Avaliação</Text>
          </View>
        </View>

        {/* Ações Rápidas */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionCard}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="calendar" size={24} color="#4A5D23" />
              </View>
              <Text style={styles.quickActionText}>17</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="cash" size={24} color="#4A5D23" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="person" size={24} color="#4A5D23" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="document" size={24} color="#4A5D23" />
              </View>
            </TouchableOpacity>
          </View>
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
  content: {
    flex: 1,
    padding: 20,
  },
  greetingContainer: {
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  dateText: {
    fontSize: 14,
    color: "#666",
  },
  activeJobCard: {
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
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  activebadge: {
    backgroundColor: "#FF6B35",
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
    color: "#666",
    fontSize: 14,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationText: {
    marginLeft: 8,
    color: "#666",
    fontSize: 14,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 8,
  },
  progressLabel: {
    color: "#666",
    fontSize: 14,
  },
  progressPercentage: {
    color: "#4A5D23",
    fontSize: 14,
    fontWeight: "bold",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginBottom: 20,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FF6B35",
    borderRadius: 4,
  },
  jobActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  continueButton: {
    backgroundColor: "#4A5D23",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  continueButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#4A5D23",
    borderRadius: 8,
  },
  detailsButtonText: {
    color: "#4A5D23",
    marginLeft: 5,
    fontWeight: "bold",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  quickActionsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  quickActionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickActionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickActionIcon: {
    marginBottom: 10,
  },
  quickActionText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});
