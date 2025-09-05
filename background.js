// background.js

let matchId = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "setMatchId") {
    matchId = request.matchId;
    sendResponse({ status: "ID registrado" });
  }

  if (request.action === "requestDownloadOnReload") {
    chrome.storage.local.set({ shouldDownload: true, matchId: request.matchId })
      .then(() => {
        sendResponse({ status: "Marcado para download após recarregar" });
        chrome.tabs.reload(sender.tab.id);
      })
      .catch(err => {
        console.error("Erro ao salvar no storage:", err);
        sendResponse({ error: err });
      });

    return true; // Mantém a conexão aberta para respostas assíncronas
  }
});

chrome.webRequest.onCompleted.addListener(
  async (details) => {
    try {
      const url = new URL(details.url);
      const match = url.pathname.match(/\/lobby\/match\/(\d+)\/1$/);
      if (!match) return;

      const currentMatchId = match[1];

      const stored = await chrome.storage.local.get(["shouldDownload", "matchId"]);
      if (!stored.shouldDownload || stored.matchId !== currentMatchId) return;

      const response = await fetch(details.url, {
        method: 'GET',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: "downloadFormattedData",
            rawData: data
          });
        });

        chrome.storage.local.remove(["shouldDownload", "matchId"]);
      }
    } catch (error) {
      console.error("Erro ao capturar dados:", error);
    }
  },
  {
    urls: ["https://gamersclub.com.br/lobby/match/*/1"]
  }
);