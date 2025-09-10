// src/services/apiService.js - MOBILE INTEGRADO COM FRETES

const API_BASE_URL = "http://192.168.1.17:3000";

class ApiService {
  async makeRequest(endpoint, options = {}) {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log("🔗 Fazendo requisição para:", url);

      const config = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
        ...options,
      };

      console.log("📤 Dados enviados:", options.body || "Nenhum");

      const response = await fetch(url, config);
      console.log("📥 Status da resposta:", response.status);

      const data = await response.json();
      console.log("📄 Dados recebidos:", data);

      if (!response.ok) {
        throw new Error(data.error || `Erro HTTP: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("❌ Erro na requisição:", error);
      throw error;
    }
  }

  // ===================================
  // AUTENTICAÇÃO MOTORISTA
  // ===================================

  async loginMotorista(email, senha) {
    if (!email || !senha) {
      throw new Error("Email e senha são obrigatórios");
    }

    return this.makeRequest("/api/auth/login-motorista", {
      method: "POST",
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        senha,
      }),
    });
  }

  async registerMotorista(dadosMotorista) {
    const { nome, usuario, cpf, email, senha } = dadosMotorista;

    if (!nome || !usuario || !cpf || !email || !senha) {
      throw new Error("Todos os campos são obrigatórios");
    }

    const cpfLimpo = String(cpf).replace(/\D/g, "");

    return this.makeRequest("/api/auth/register-motorista", {
      method: "POST",
      body: JSON.stringify({
        nome: nome.trim(),
        usuario: usuario.trim().toLowerCase(),
        cpf: cpfLimpo,
        email: email.trim().toLowerCase(),
        senha,
      }),
    });
  }

  // ===================================
  // SISTEMA DE CONVITES
  // ===================================

  async buscarConvitesMotorista(motoristaId) {
    return this.makeRequest(`/api/auth/motorista/${motoristaId}/convites`);
  }

  async aceitarConvite(conviteId, motoristaId) {
    return this.makeRequest(`/api/auth/convites/${conviteId}/aceitar`, {
      method: "PUT",
      body: JSON.stringify({ motoristaId }),
    });
  }

  async rejeitarConvite(conviteId, motoristaId) {
    return this.makeRequest(`/api/auth/convites/${conviteId}/rejeitar`, {
      method: "PUT", 
      body: JSON.stringify({ motoristaId }),
    });
  }

  // ===================================
  // SISTEMA DE FRETES - MOTORISTA
  // ===================================

  // Buscar fretes oferecidos para o motorista (pendentes de resposta)
  async buscarFretesOferecidos(motoristaId) {
    return this.makeRequest(`/fretes/motorista/${motoristaId}/oferecidos`);
  }

  // Buscar fretes ativos do motorista (aceitos/em andamento)
  async buscarFretesAtivos(motoristaId) {
    return this.makeRequest(`/fretes/motorista/${motoristaId}/ativos`);
  }

  // Buscar histórico completo de fretes do motorista
  async buscarHistoricoFretes(motoristaId) {
    // Esta rota precisa ser implementada no backend se necessário
    // Por enquanto, podemos usar a mesma lógica dos ativos filtrados
    return this.makeRequest(`/fretes/motorista/${motoristaId}/historico`);
  }

  // Aceitar frete oferecido
  async aceitarFrete(freteId, motoristaId) {
    return this.makeRequest(`/fretes/${freteId}/aceitar`, {
      method: "PUT",
      body: JSON.stringify({ motoristaId }),
    });
  }

  // Recusar frete oferecido
  async recusarFrete(freteId, motoristaId, observacoes = null) {
    return this.makeRequest(`/fretes/${freteId}/recusar`, {
      method: "PUT",
      body: JSON.stringify({ 
        motoristaId, 
        observacoes: observacoes || "Recusado pelo motorista via app"
      }),
    });
  }

  // Buscar detalhes de um frete específico
  async buscarDetalheFrete(freteId) {
    return this.makeRequest(`/fretes/${freteId}`);
  }

  // ===================================
  // STATUS DO MOTORISTA
  // ===================================

  // Atualizar status de disponibilidade do motorista
  async atualizarStatusMotorista(motoristaId, novoStatus) {
    // Esta rota precisa ser implementada no backend
    return this.makeRequest(`/api/auth/motorista/${motoristaId}/status`, {
      method: "PUT",
      body: JSON.stringify({ 
        status_disponibilidade: novoStatus // livre, indisponivel, em-frete
      }),
    });
  }

  // Buscar dados atualizados do motorista
  async buscarDadosMotorista(motoristaId) {
    return this.makeRequest(`/api/auth/motorista/${motoristaId}`);
  }

  // ===================================
  // MÉTODOS LEGADOS (compatibilidade)
  // ===================================

  async login(email, senha) {
    return this.loginMotorista(email, senha);
  }

  async register(dadosUsuario) {
    return this.registerMotorista(dadosUsuario);
  }

  // ===================================
  // UTILITÁRIOS
  // ===================================

  async testConnection() {
    try {
      const response = await this.makeRequest("/health");
      console.log("✅ Conexão com servidor OK!");
      return response;
    } catch (error) {
      console.log("❌ Erro de conexão:", error.message);
      throw error;
    }
  }

  setBaseURL(newURL) {
    this.API_BASE_URL = newURL;
    console.log("🔄 Nova URL configurada:", newURL);
  }

  getBaseURL() {
    return API_BASE_URL;
  }

  // ===================================
  // HELPER METHODS PARA FRETES
  // ===================================

  // Método auxiliar para carregar todos os fretes de um motorista
  async carregarTodosFretes(motoristaId) {
    try {
      const [oferecidos, ativos] = await Promise.all([
        this.buscarFretesOferecidos(motoristaId),
        this.buscarFretesAtivos(motoristaId)
      ]);

      return {
        success: true,
        fretes: {
          oferecidos: oferecidos.success ? oferecidos.fretes : [],
          ativos: ativos.success ? ativos.fretes : [],
          historico: [] // Implementar quando necessário
        }
      };
    } catch (error) {
      console.error("❌ Erro ao carregar todos os fretes:", error);
      return {
        success: false,
        error: error.message,
        fretes: {
          oferecidos: [],
          ativos: [],
          historico: []
        }
      };
    }
  }

  // Método para verificar se o motorista tem fretes pendentes
  async verificarFretesPendentes(motoristaId) {
    try {
      const oferecidos = await this.buscarFretesOferecidos(motoristaId);
      return oferecidos.success ? oferecidos.fretes.length > 0 : false;
    } catch (error) {
      console.error("❌ Erro ao verificar fretes pendentes:", error);
      return false;
    }
  }

  // Método para verificar se o motorista está em serviço
  async verificarStatusEmServico(motoristaId) {
    try {
      const ativos = await this.buscarFretesAtivos(motoristaId);
      return ativos.success ? ativos.fretes.length > 0 : false;
    } catch (error) {
      console.error("❌ Erro ao verificar status em serviço:", error);
      return false;
    }
  }

  // ===================================
  // FORMATAÇÃO E UTILITÁRIOS DE DADOS
  // ===================================

  formatarValor(valor) {
    if (typeof valor === 'number') {
      return `R$ ${valor.toFixed(2).replace('.', ',')}`;
    }
    return valor;
  }

  formatarData(dataString) {
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString('pt-BR');
    } catch (error) {
      return dataString;
    }
  }

  formatarDataHora(dataString) {
    try {
      const data = new Date(dataString);
      return data.toLocaleString('pt-BR');
    } catch (error) {
      return dataString;
    }
  }

  // ===================================
  // LOGS E DEBUG
  // ===================================

  log(message, data = null) {
    console.log(`🔧 ApiService: ${message}`, data || '');
  }

  error(message, error = null) {
    console.error(`❌ ApiService Error: ${message}`, error || '');
  }
}

export default new ApiService();