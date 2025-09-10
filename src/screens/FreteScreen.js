import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "../navigation/AppNavigator";
import apiService from "../services/apiService";

export default function FreteScreen() {
  const { userData } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [fretesOferecidos, setFretesOferecidos] = useState([]);
  const [fretesAtivos, setFretesAtivos] = useState([]);
  const [fretesHistorico, setFretesHistorico] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData?.id) {
      carregarFretes();
    }
  }, [userData]);

  const carregarFretes = async () => {
    if (!userData?.id) {
      console.error("❌ ID do motorista não encontrado");
      return;
    }

    try {
      setLoading(true);
      console.log("🚛 Carregando fretes para motorista:", userData.id);

      // Carregar fretes oferecidos (pendentes de resposta)
      const oferecidos = await fetch(`${apiService.getBaseURL()}/fretes/motorista/${userData.id}/oferecidos`);
      const oferecidosData = await oferecidos.json();

      // Carregar fretes ativos (aceitos/em andamento)
      const ativos = await fetch(`${apiService.getBaseURL()}/fretes/motorista/${userData.id}/ativos`);
      const ativosData = await ativos.json();

      // Carregar histórico de fretes finalizados
      const historico = await fetch(`${apiService.getBaseURL()}/fretes/motorista/${userData.id}/historico`);
      const historicoData = await historico.json();

      if (oferecidosData.success) {
        setFretesOferecidos(oferecidosData.fretes || []);
      }

      if (ativosData.success) {
        setFretesAtivos(ativosData.fretes || []);
      }

      if (historicoData.success) {
        setFretesHistorico(historicoData.fretes || []);
      }

      console.log("✅ Fretes carregados:");
      console.log("  - Oferecidos:", oferecidosData.fretes?.length || 0);
      console.log("  - Ativos:", ativosData.fretes?.length || 0);
      console.log("  - Histórico:", historicoData.fretes?.length || 0);

    } catch (error) {
      console.error("❌ Erro ao carregar fretes:", error);
      Alert.alert("Erro", "Não foi possível carregar os fretes. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const aceitarFrete = async (frete) => {
    Alert.alert(
      "Aceitar Frete",
      `Você deseja aceitar o frete ${frete.codigo_frete}?\n\nOrigem: ${frete.origem}\nDestino: ${frete.destino}\nValor: ${formatarValor(frete.valor)}`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Aceitar",
          onPress: async () => {
            try {
              console.log("✅ Aceitando frete:", frete.id);

              const response = await fetch(`${apiService.getBaseURL()}/fretes/${frete.id}/aceitar`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  motoristaId: userData.id
                })
              });

              const data = await response.json();

              if (data.success) {
                Alert.alert("Sucesso!", "Frete aceito com sucesso!");
                await carregarFretes(); // Recarregar listas
              } else {
                Alert.alert("Erro", data.error || "Erro ao aceitar frete");
              }
            } catch (error) {
              console.error("❌ Erro ao aceitar frete:", error);
              Alert.alert("Erro", "Não foi possível aceitar o frete. Tente novamente.");
            }
          }
        }
      ]
    );
  };

  const recusarFrete = async (frete) => {
    Alert.alert(
      "Recusar Frete",
      `Você deseja recusar o frete ${frete.codigo_frete}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Recusar",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("❌ Recusando frete:", frete.id);

              const response = await fetch(`${apiService.getBaseURL()}/fretes/${frete.id}/recusar`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  motoristaId: userData.id,
                  observacoes: "Recusado pelo motorista via app"
                })
              });

              const data = await response.json();

              if (data.success) {
                Alert.alert("Frete Recusado", "O frete foi recusado.");
                await carregarFretes(); // Recarregar listas
              } else {
                Alert.alert("Erro", data.error || "Erro ao recusar frete");
              }
            } catch (error) {
              console.error("❌ Erro ao recusar frete:", error);
              Alert.alert("Erro", "Não foi possível recusar o frete. Tente novamente.");
            }
          }
        }
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarFretes();
    setRefreshing(false);
  };

  const formatarValor = (valor) => {
    if (typeof valor === 'number') {
      return `R$ ${valor.toFixed(2).replace('.', ',')}`;
    }
    return valor;
  };

  const renderFreteOferecido = (frete) => (
    <View key={frete.id} style={styles.freteCard}>
      <View style={styles.freteHeader}>
        <View style={styles.empresaBadge}>
          <Text style={styles.empresaText}>{frete.nome_empresa}</Text>
        </View>
        <Text style={styles.freteId}>{frete.codigo_frete}</Text>
      </View>

      <Text style={styles.freteTitulo}>Novo Frete Oferecido</Text>

      <View style={styles.rotaContainer}>
        <View style={styles.localContainer}>
          <Ionicons name="location" size={16} color="#8B5CF6" />
          <Text style={styles.localText}>{frete.origem}</Text>
        </View>
        <Ionicons name="arrow-forward" size={16} color="#6B7280" />
        <View style={styles.localContainer}>
          <Ionicons name="location" size={16} color="#EF4444" />
          <Text style={styles.localText}>{frete.destino}</Text>
        </View>
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Ionicons name="speedometer" size={16} color="#6B7280" />
          <Text style={styles.infoText}>{frete.distancia || 'N/A'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="cash" size={16} color="#10B981" />
          <Text style={styles.infoText}>{formatarValor(frete.valor)}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="cube" size={16} color="#F59E0B" />
          <Text style={styles.infoText}>{frete.tipo_carga}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="barbell" size={16} color="#8B5CF6" />
          <Text style={styles.infoText}>{frete.peso || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.eixosContainer}>
        <Text style={styles.eixosLabel}>Eixos necessários:</Text>
        <Text style={styles.eixosValue}>{frete.eixos_requeridos || 3}</Text>
      </View>

      {frete.observacoes && (
        <View style={styles.observacoesContainer}>
          <Text style={styles.observacoesLabel}>Observações:</Text>
          <Text style={styles.observacoesText}>{frete.observacoes}</Text>
        </View>
      )}

      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.recusarButton}
          onPress={() => recusarFrete(frete)}
        >
          <Ionicons name="close" size={18} color="#EF4444" />
          <Text style={styles.recusarText}>Recusar</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.aceitarButton}
          onPress={() => aceitarFrete(frete)}
        >
          <Ionicons name="checkmark" size={18} color="white" />
          <Text style={styles.aceitarText}>Aceitar Frete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFreteAtivo = (frete) => (
    <View key={frete.id} style={styles.freteAceitoCard}>
      <View style={styles.freteHeader}>
        <View style={styles.statusAceitoBadge}>
          <Ionicons name="checkmark" size={14} color="white" />
          <Text style={styles.statusText}>Em Andamento</Text>
        </View>
        <Text style={styles.freteId}>{frete.codigo_frete}</Text>
      </View>

      <Text style={styles.freteTitulo}>Frete Aceito</Text>

      <View style={styles.rotaContainer}>
        <View style={styles.localContainer}>
          <Ionicons name="location" size={16} color="#8B5CF6" />
          <Text style={styles.localText}>{frete.origem}</Text>
        </View>
        <Ionicons name="arrow-forward" size={16} color="#6B7280" />
        <View style={styles.localContainer}>
          <Ionicons name="location" size={16} color="#EF4444" />
          <Text style={styles.localText}>{frete.destino}</Text>
        </View>
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Ionicons name="speedometer" size={16} color="#6B7280" />
          <Text style={styles.infoText}>{frete.distancia || 'N/A'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="cash" size={16} color="#10B981" />
          <Text style={styles.infoText}>{formatarValor(frete.valor)}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="cube" size={16} color="#F59E0B" />
          <Text style={styles.infoText}>{frete.tipo_carga}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="barbell" size={16} color="#8B5CF6" />
          <Text style={styles.infoText}>{frete.peso || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.empresaInfo}>
        <Text style={styles.empresaLabel}>Empresa:</Text>
        <Text style={styles.empresaNome}>{frete.nome_empresa}</Text>
      </View>

      <View style={styles.statusInfo}>
        <Text style={styles.statusLabel}>Status: Em execução</Text>
      </View>
    </View>
  );

  const renderHistoricoItem = (frete) => (
    <View key={frete.id} style={styles.historicoCard}>
      <View style={styles.freteHeader}>
        <View style={styles.finalizadoBadge}>
          <Ionicons name="checkmark-circle" size={14} color="white" />
          <Text style={styles.statusText}>Concluído</Text>
        </View>
        <Text style={styles.freteId}>{frete.codigo_frete}</Text>
      </View>

      <Text style={styles.freteTitulo}>{frete.tipo_carga}</Text>

      <View style={styles.rotaContainer}>
        <View style={styles.localContainer}>
          <Ionicons name="location" size={16} color="#6B7280" />
          <Text style={styles.localText}>{frete.origem}</Text>
        </View>
        <Ionicons name="arrow-forward" size={16} color="#6B7280" />
        <View style={styles.localContainer}>
          <Ionicons name="location" size={16} color="#6B7280" />
          <Text style={styles.localText}>{frete.destino}</Text>
        </View>
      </View>

      <View style={styles.historicoInfo}>
        <Text style={styles.historicoLabel}>Valor: {formatarValor(frete.valor)}</Text>
        <Text style={styles.historicoData}>
          Concluído em {new Date(frete.data_finalizacao).toLocaleDateString('pt-BR')}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#8B5CF6" barStyle="light-content" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Fretes</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando fretes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#8B5CF6" barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fretes</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Fretes Ativos */}
        {fretesAtivos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fretes em Andamento</Text>
            {fretesAtivos.map(renderFreteAtivo)}
          </View>
        )}

        {/* Fretes Oferecidos */}
        {fretesOferecidos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ofertas Pendentes</Text>
            {fretesOferecidos.map(renderFreteOferecido)}
          </View>
        )}

        {/* Histórico */}
        {fretesHistorico.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Histórico</Text>
            {fretesHistorico.map(renderHistoricoItem)}
          </View>
        )}

        {/* Estado Vazio */}
        {fretesOferecidos.length === 0 && fretesAtivos.length === 0 && fretesHistorico.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>Nenhum frete disponível</Text>
            <Text style={styles.emptyText}>
              Quando fretes forem oferecidos para você, aparecerão aqui
            </Text>
          </View>
        )}

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
  header: {
    backgroundColor: "#8B5CF6",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  freteCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  freteAceitoCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  historicoCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#6B7280",
  },
  freteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  empresaBadge: {
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  empresaText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  statusAceitoBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  finalizadoBadge: {
    backgroundColor: "#6B7280",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
  freteId: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "500",
  },
  freteTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  rotaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  localContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  localText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  eixosContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  eixosLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  eixosValue: {
    fontSize: 16,
    color: "#8B5CF6",
    fontWeight: "bold",
  },
  observacoesContainer: {
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  observacoesLabel: {
    fontSize: 12,
    color: "#92400E",
    fontWeight: "600",
    marginBottom: 4,
  },
  observacoesText: {
    fontSize: 14,
    color: "#92400E",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recusarButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    flex: 0.4,
    justifyContent: "center",
  },
  recusarText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#EF4444",
    fontWeight: "600",
  },
  aceitarButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 0.55,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  aceitarText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  empresaInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F0F9FF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  empresaLabel: {
    fontSize: 14,
    color: "#0369A1",
    fontWeight: "500",
  },
  empresaNome: {
    fontSize: 14,
    color: "#0369A1",
    fontWeight: "bold",
  },
  statusInfo: {
    backgroundColor: "#F0FDF4",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  statusLabel: {
    fontSize: 14,
    color: "#166534",
    fontWeight: "600",
  },
  historicoInfo: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  historicoLabel: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
    marginBottom: 4,
  },
  historicoData: {
    fontSize: 12,
    color: "#6B7280",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    maxWidth: 280,
  },
  bottomSpacing: {
    height: 40,
  },
});