import axios from "axios";

// 🔴 MUDANÇA: Use a mesma URL base do apiService.js
const API_BASE_URL = "http://192.168.0.109:3000"; // Mesmo IP do apiService.js

export const atualizarImagemNoBanco = async (userId, imageUrl) => {
  try {
    console.log("🔄 Atualizando imagem no banco para usuário:", userId);
    console.log("🖼️ URL da imagem:", imageUrl);

    const response = await axios.put(
      `${API_BASE_URL}/usuarios/${userId}/imagem`,
      {
        imagem_url: imageUrl,
      },
      {
        timeout: 10000, // 10 segundos de timeout
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      console.log("✅ Imagem salva no banco!");
      return {
        success: true,
        data: response.data,
      };
    } else {
      console.log("⚠️ Resposta inesperada:", response.status);
      return {
        success: false,
        error: "Status inesperado",
      };
    }
  } catch (error) {
    console.error("❌ Erro ao atualizar imagem_url:", error);

    let errorMessage = "Erro ao atualizar imagem no banco";

    if (error.code === "ECONNABORTED") {
      errorMessage = "Timeout - servidor demorou para responder";
    } else if (error.response) {
      errorMessage =
        error.response.data?.error || `Erro HTTP: ${error.response.status}`;
    } else if (error.request) {
      errorMessage = "Erro de conexão com o servidor";
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};
