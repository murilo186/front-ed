export const uploadImage = async (uri, userId) => {
  const formData = new FormData();

  const filename = uri.split("/").pop();
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : `image`;

  formData.append("image", {
    uri,
    name: filename,
    type,
  });

  // Enviar userId junto
  formData.append("userId", userId);

  try {
    // 🔴 MUDANÇA PRINCIPAL: Use a mesma URL do apiService.js
    const response = await fetch(
      "http://192.168.0.109:3000/images/upload-foto",
      {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const data = await response.json();

    if (response.ok && data.success) {
      return data.imageUrl; // URL da imagem salva no servidor
    } else {
      console.error("Erro no upload:", data.error);
      alert(data.error || "Erro ao enviar a imagem");
      return null;
    }
  } catch (error) {
    console.error("Erro na requisição de upload:", error);
    alert("Erro ao enviar a imagem");
    return null;
  }
};
