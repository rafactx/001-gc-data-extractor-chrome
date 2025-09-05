// content.js

console.log("🟢 GamersClub Downloader: content script carregado!");

function getMatchId() {
  const match = window.location.pathname.match(/\/lobby\/match\/(\d+)/);
  return match ? match[1] : null;
}

function addButton() {
  if (document.getElementById("gc-download-button")) return;

  const button = document.createElement("button");
  button.id = "gc-download-button";
  button.innerText = "📥 Baixar JSON Completo (recarrega)";
  button.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 99999;
    background: #2c7be5;
    color: white;
    border: none;
    padding: 12px 18px;
    font-size: 14px;
    font-weight: bold;
    border-radius: 8px;
    cursor: pointer;
    box-shadow: 0 3px 8px rgba(0,0,0,0.2);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
    transition: background 0.2s;
  `;

  button.onmouseover = () => button.style.background = "#2668c4";
  button.onmouseout = () => button.style.background = "#2c7be5";

  button.addEventListener("click", () => {
    const matchId = getMatchId();
    if (!matchId) {
      console.warn("❌ Não foi possível extrair o ID da partida.");
      return;
    }

    console.log(`📥 Solicitando download para a partida: ${matchId}`);
    chrome.runtime.sendMessage({
      action: "requestDownloadOnReload",
      matchId: matchId
    });
  });

  document.body.appendChild(button);
  console.log("🟢 Botão adicionado na página.");
}

const matchId = getMatchId();
if (matchId) {
  chrome.runtime.sendMessage({ action: "setMatchId", matchId: matchId });
} else {
  console.warn("❌ URL inválida: não é uma página de partida.");
}

chrome.storage.local.get(["shouldDownload"], (result) => {
  if (chrome.runtime.lastError) {
    console.error("❌ Erro ao acessar storage.local:", chrome.runtime.lastError);
    addButton();
    return;
  }

  if (result && result.shouldDownload === true) {
    console.log("🔄 Modo automático ativado. Aguardando dados do background...");
  } else {
    console.log("ℹ️ Modo manual. Exibindo botão.");
    addButton();
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "downloadFormattedData") {
    console.log("📥 Recebido: dados da partida para download.");

    const rawData = request.rawData;
    if (!rawData || !rawData.success) {
      console.error("❌ Dados inválidos recebidos:", rawData);
      return;
    }

    try {
      // Download completo dos dados brutos sem nenhum tratamento
      const jsonStr = JSON.stringify(rawData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gamersclub_match_complete_${rawData.id}.json`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log("✅ Download completo concluído com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao baixar JSON completo:", error);
    }
  }
});