// src/services/apiService.js

// ⚠️ IMPORTANTE: ALTERE ESTE IP PARA O IP DA SUA MÁQUINA
// Para descobrir seu IP:
// Windows: digite "ipconfig" no cmd
// Mac/Linux: digite "ifconfig" no terminal
// Use o IP da sua rede local (ex: 192.168.1.100)

const API_BASE_URL = "https://backend-production-5141.up.railway.app"; // 🔴 ALTERE AQUI!

class ApiService {
  // Método auxiliar para fazer requisições
  async makeRequest(endpoint, options = {}) {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log("🔗 Fazendo requisição para:", url);

      const config = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10 segundos de timeout
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

      // Verificar diferentes tipos de erro
      if (error.message === "Network request failed") {
        throw new Error(
          "Erro de conexão. Verifique:\n• Se o servidor está rodando\n• Se o IP está correto\n• Sua conexão com a internet"
        );
      }

      if (error.message.includes("timeout")) {
        throw new Error(
          "Timeout na requisição. Servidor demorou para responder."
        );
      }

      throw error;
    }
  }

  // Login
  async login(email, senha) {
    if (!email || !senha) {
      throw new Error("Email e senha são obrigatórios");
    }

    return this.makeRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        senha,
      }),
    });
  }

  // Cadastro
  async register(dadosUsuario) {
    const { nome, usuario, cpf, email, senha } = dadosUsuario;

    // Validações locais
    if (!nome || !usuario || !cpf || !email || !senha) {
      throw new Error("Todos os campos são obrigatórios");
    }

    // Limpar CPF (apenas números)
    const cpfLimpo = String(cpf).replace(/\D/g, "");
    console.log("📦 Enviando CPF limpo:", cpfLimpo);

    return this.makeRequest("/auth/register", {
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

  // Testar conexão com o servidor
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

  // Método para configurar novo IP (útil para desenvolvimento)
  setBaseURL(newURL) {
    this.API_BASE_URL = newURL;
    console.log("🔄 Nova URL configurada:", newURL);
  }

  // Getter para obter a URL atual
  getBaseURL() {
    return API_BASE_URL;
  }
}

// Exportar uma instância única (singleton)
export default new ApiService();
