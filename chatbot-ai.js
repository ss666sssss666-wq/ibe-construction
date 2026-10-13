import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = "AIzaSyB4DwSpnJAZlTnEP_ngdPQb_0fK2kcBxzg";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

class IBEChatbot {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.isTyping = false;
    this.chatHistory = [];
    this.modelName = "gemini-1.5-flash"; // Par défaut
    this.init();
    this.discoverModel();
  }

  async discoverModel() {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.models && data.models.length > 0) {
        // On cherche en priorité le modèle 1.5 flash ou n'importe quel flash disponible
        const bestModel =
          data.models.find((m) => m.name.includes("gemini-1.5-flash")) ||
          data.models.find((m) => m.name.includes("flash")) ||
          data.models[0];

        this.modelName = bestModel.name.replace("models/", "");
        console.log("Modèle fonctionnel détecté :", this.modelName);
        this.model = genAI.getGenerativeModel({ model: this.modelName });
      } else {
        this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      }
    } catch (e) {
      this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }
  }

  getSystemPrompt() {
    return `Tu es l'assistant IA officiel d'IBE Construction (Maroc). Tu es un ingénieur conseil expert.

COORDONNÉES :
- Téléphone : +212 663-176838
- Email : ibe@ibe-construction.com
- Adresse : 69 boulevard Hassan II, Mohammedia 28800

EXPERTISE :
- Bureau d'études Structure (BIM, Revit, Béton, Métal).
- Réalisation & Gros Œuvre.
- Fluides & Génie Climatique.

TON : Professionnel, réactif et précis.`;
  }

  async getAIResponse(userMessage) {
    try {
      if (!this.model) await this.discoverModel();

      const chat = this.model.startChat({
        history: this.chatHistory,
      });

      const promptComplet = `INSTRUCTIONS : ${this.getSystemPrompt()}\n\nClient: ${userMessage}`;
      const result = await chat.sendMessage(promptComplet);
      const response = await result.response;
      const aiText = response.text();

      this.chatHistory.push({ role: "user", parts: [{ text: userMessage }] });
      this.chatHistory.push({ role: "model", parts: [{ text: aiText }] });

      if (this.chatHistory.length > 10) {
        this.chatHistory = this.chatHistory.slice(-10);
        if (this.chatHistory.length > 0 && this.chatHistory[0].role !== "user")
          this.chatHistory.shift();
      }

      return aiText;
    } catch (error) {
      console.error("Gemini Error:", error);
      if (error.message.includes("429")) {
        return "Le système est un peu saturé ! 🚀 Merci de patienter une petite minute.";
      }
      return `Désolé, j'ai un petit souci technique. 🛠️\n(Détail: ${error.message})`;
    }
  }

  init() {
    this.createChatWidget();
    this.attachEventListeners();
  }

  createChatWidget() {
    const chatHTML = `
            <div id="ibe-chatbot" class="ibe-chatbot">
                <div class="chatbot-button" id="chatbot-toggle">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                </div>
                <div class="chatbot-window" id="chatbot-window">
                    <div class="chatbot-header">
                        <div class="chatbot-header-text">
                            <h3>Assistant IA IBE</h3>
                            <span class="chatbot-status">🟢 En ligne</span>
                        </div>
                        <button class="chatbot-close" id="chatbot-close">✕</button>
                    </div>
                    <div class="chatbot-messages" id="chatbot-messages"></div>
                    <div class="chatbot-input-area">
                        <input type="text" id="chatbot-input" placeholder="Posez votre question..." autocomplete="off" />
                        <button id="chatbot-send">➤</button>
                    </div>
                </div>
            </div>
        `;
    document.body.insertAdjacentHTML("beforeend", chatHTML);
  }

  attachEventListeners() {
    document.getElementById("chatbot-toggle").onclick = () => this.toggleChat();
    document.getElementById("chatbot-close").onclick = () => this.toggleChat();
    document.getElementById("chatbot-send").onclick = () => this.sendMessage();
    document.getElementById("chatbot-input").onkeypress = (e) => {
      if (e.key === "Enter") this.sendMessage();
    };
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    document
      .getElementById("chatbot-window")
      .classList.toggle("active", this.isOpen);
    if (this.isOpen && this.messages.length === 0) {
      this.addBotMessage(
        "Bonjour ! 👋 Je suis l'assistant IA d'IBE Construction. Comment puis-je vous aider ?",
      );
    }
  }

  async sendMessage() {
    const input = document.getElementById("chatbot-input");
    const message = input.value.trim();
    if (!message || this.isTyping) return;
    this.addUserMessage(message);
    input.value = "";
    this.showTypingIndicator();
    const response = await this.getAIResponse(message);
    this.hideTypingIndicator();
    this.addBotMessage(response);
  }

  showTypingIndicator() {
    this.isTyping = true;
    const msgDiv = document.getElementById("chatbot-messages");
    const div = document.createElement("div");
    div.id = "typing";
    div.className = "chatbot-message bot-message";
    div.innerHTML = "<i>IA en train de réfléchir...</i>";
    msgDiv.appendChild(div);
    msgDiv.scrollTop = msgDiv.scrollHeight;
  }

  hideTypingIndicator() {
    this.isTyping = false;
    const div = document.getElementById("typing");
    if (div) div.remove();
  }

  addUserMessage(text) {
    this.messages.push({ type: "user", text });
    this.renderMessage("user", text);
  }

  addBotMessage(text) {
    this.messages.push({ type: "bot", text });
    this.renderMessage("bot", text);
  }

  renderMessage(type, text) {
    const msgDiv = document.getElementById("chatbot-messages");
    const div = document.createElement("div");
    div.className = `chatbot-message ${type}-message`;
    div.innerHTML = text.replace(/\n/g, "<br>");
    msgDiv.appendChild(div);
    msgDiv.scrollTop = msgDiv.scrollHeight;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new IBEChatbot();
});
