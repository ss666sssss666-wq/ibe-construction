// ==========================================
// CHATBOT IA INTELLIGENT AVEC GOOGLE GEMINI API
// IBE Construction - Assistant Virtuel
// ==========================================

class IBEChatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.isTyping = false;

        // IMPORTANT: Remplacez par votre clé API Gemini
        // Obtenez-la gratuitement sur: https://makersuite.google.com/app/apikey
        this.apiKey = 'YOUR_GEMINI_API_KEY_HERE';
        this.apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

        this.systemPrompt = this.getSystemPrompt();
        this.init();
    }

    getSystemPrompt() {
        const lang = document.documentElement.lang || 'fr';

        const prompts = {
            fr: `Tu es l'assistant virtuel d'IBE Construction, une entreprise marocaine basée à Mohammedia.

INFORMATIONS ENTREPRISE:
- Nom: IBE Construction
- Localisation: 69 boulevard Hassan II, Mohammedia 28800, Maroc
- Téléphone: +212 663-176838
- Email: ibebuilds@gmail.com
- Instagram: @ibe.construction
- Horaires: Lundi-Vendredi 9h-18h

SERVICES (3 PÔLES D'EXPERTISE):

1. 🏗️ BUREAU D'ÉTUDES STRUCTURE
   - Conception structurelle BIM/Revit
   - Calculs Robot Structural Analysis
   - Béton armé et charpente métallique
   - Logiciels: Revit Structure, Robot, Advance Steel

2. 🏢 RÉALISATION & GROS ŒUVRE
   - Gestion de chantier rigoureuse
   - Coordination OPC
   - Contrôle qualité
   - Du terrassement aux finitions

3. ❄️ GÉNIE CLIMATIQUE & FLUIDES
   - Systèmes CVC/HVAC
   - Plomberie et réseaux industriels
   - Modélisation Plant 3D et Revit MEP
   - Calculs thermiques

AVANTAGES IBE:
- Délai de réponse: 24-48h (vs 1-2 semaines concurrents)
- 1 équipe intégrée (vs 3+ entreprises)
- 100% BIM natif
- Contact direct avec ingénieurs (pas de commercial)
- 1 seule marge (vs 3 marges cumulées)
- Réduction de 90% des aléas grâce au BIM

PROJETS RÉALISÉS:
- Industriel: Plateformes logistiques 15000+ m², hangars métalliques, usines
- Résidentiel: Immeubles, résidences, villas, structures béton armé
- Médical: Hôpitaux, cliniques, infrastructures de santé

TARIFICATION:
- Dépend du type de projet (résidentiel/industriel/médical)
- Surface et complexité
- Services demandés
- Calculateur en ligne disponible sur le site
- Étude technique gratuite sous conditions

TON RÔLE:
- Réponds de manière professionnelle mais chaleureuse
- Utilise des emojis avec modération
- Sois concis (2-3 phrases max sauf si détails demandés)
- Oriente vers le calculateur pour les devis
- Encourage à contacter directement pour projets complexes
- Parle en français professionnel
- Si tu ne sais pas, propose de contacter l'équipe

IMPORTANT: Ne jamais inventer de prix ou délais précis. Toujours rediriger vers le calculateur ou contact direct.`,

            en: `You are the virtual assistant for IBE Construction, a Moroccan company based in Mohammedia.

COMPANY INFO:
- Name: IBE Construction
- Location: 69 boulevard Hassan II, Mohammedia 28800, Morocco
- Phone: +212 663-176838
- Email: ibebuilds@gmail.com
- Instagram: @ibe.construction
- Hours: Monday-Friday 9am-6pm

SERVICES (3 EXPERTISE AREAS):

1. 🏗️ STRUCTURAL ENGINEERING
   - BIM/Revit structural design
   - Robot Structural Analysis calculations
   - Reinforced concrete and steel structures
   - Software: Revit Structure, Robot, Advance Steel

2. 🏢 CONSTRUCTION & CIVIL WORKS
   - Rigorous site management
   - OPC coordination
   - Quality control
   - From excavation to finishes

3. ❄️ HVAC & FLUIDS
   - HVAC systems
   - Plumbing and industrial networks
   - Plant 3D and Revit MEP modeling
   - Thermal calculations

YOUR ROLE:
- Respond professionally but warmly
- Be concise (2-3 sentences max unless details requested)
- Direct to calculator for quotes
- Encourage direct contact for complex projects
- If unsure, suggest contacting the team`,

            ar: `أنت المساعد الافتراضي لشركة IBE Construction، شركة مغربية مقرها في المحمدية.

معلومات الشركة:
- الاسم: IBE Construction
- الموقع: 69 شارع الحسن الثاني، المحمدية 28800، المغرب
- الهاتف: +212 663-176838
- البريد الإلكتروني: ibebuilds@gmail.com
- إنستغرام: @ibe.construction
- ساعات العمل: الاثنين-الجمعة 9ص-6م

الخدمات (3 مجالات خبرة):

1. 🏗️ مكتب دراسات الهياكل
   - تصميم هيكلي BIM/Revit
   - حسابات Robot Structural Analysis
   - خرسانة مسلحة وهياكل معدنية

2. 🏢 الإنجاز والأعمال الكبرى
   - إدارة الموقع الصارمة
   - التنسيق OPC
   - مراقبة الجودة

3. ❄️ الهندسة المناخية والسوائل
   - أنظمة التدفئة والتهوية
   - السباكة والشبكات الصناعية
   - نمذجة Plant 3D و Revit MEP

دورك:
- الرد بشكل احترافي ودافئ
- كن موجزاً
- إذا لم تكن متأكداً، اقترح الاتصال بالفريق`
        };

        return prompts[lang] || prompts.fr;
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
                        <line x1="9" y1="10" x2="15" y2="10"></line>
                        <line x1="9" y1="14" x2="13" y2="14"></line>
                    </svg>
                    <span class="chatbot-badge">IA</span>
                </div>

                <div class="chatbot-window" id="chatbot-window">
                    <div class="chatbot-header">
                        <div class="chatbot-header-content">
                            <div class="chatbot-avatar">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                                </svg>
                            </div>
                            <div class="chatbot-header-text">
                                <h3>Assistant IA IBE</h3>
                                <span class="chatbot-status">🤖 Propulsé par Gemini</span>
                            </div>
                        </div>
                        <button class="chatbot-close" id="chatbot-close">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    <div class="chatbot-messages" id="chatbot-messages">
                        <!-- Messages will be inserted here -->
                    </div>

                    <div class="chatbot-quick-replies" id="quick-replies">
                        <button class="quick-reply" data-message="Quels sont vos services ?">🏗️ Services</button>
                        <button class="quick-reply" data-message="Je veux un devis">💰 Devis</button>
                        <button class="quick-reply" data-message="Comment vous contacter ?">📞 Contact</button>
                        <button class="quick-reply" data-message="Vos projets réalisés">📁 Projets</button>
                    </div>

                    <div class="chatbot-input-area">
                        <input 
                            type="text" 
                            id="chatbot-input" 
                            placeholder="Posez votre question..."
                            autocomplete="off"
                        />
                        <button id="chatbot-send">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatHTML);
    }

    attachEventListeners() {
        const toggleBtn = document.getElementById('chatbot-toggle');
        const closeBtn = document.getElementById('chatbot-close');
        const sendBtn = document.getElementById('chatbot-send');
        const input = document.getElementById('chatbot-input');
        const quickReplies = document.querySelectorAll('.quick-reply');

        toggleBtn.addEventListener('click', () => this.toggleChat());
        closeBtn.addEventListener('click', () => this.toggleChat());
        sendBtn.addEventListener('click', () => this.sendMessage());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.isTyping) this.sendMessage();
        });

        quickReplies.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const message = e.target.getAttribute('data-message');
                this.sendMessage(message);
            });
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        const window = document.getElementById('chatbot-window');
        const button = document.getElementById('chatbot-toggle');

        if (this.isOpen) {
            window.classList.add('active');
            button.classList.add('active');

            // Send greeting if first time
            if (this.messages.length === 0) {
                this.addBotMessage("Bonjour ! 👋 Je suis l'assistant IA d'IBE Construction.\n\nComment puis-je vous aider aujourd'hui ?");
            }
        } else {
            window.classList.remove('active');
            button.classList.remove('active');
        }
    }

    async sendMessage(text = null) {
        const input = document.getElementById('chatbot-input');
        const message = text || input.value.trim();

        if (!message || this.isTyping) return;

        this.addUserMessage(message);
        input.value = '';

        // Check if API key is configured
        if (this.apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
            setTimeout(() => {
                this.addBotMessage("⚠️ L'API Gemini n'est pas encore configurée.\n\nPour activer l'IA, veuillez :\n1. Obtenir une clé API gratuite sur https://makersuite.google.com/app/apikey\n2. Remplacer 'YOUR_GEMINI_API_KEY_HERE' dans chatbot-ai.js\n\nEn attendant, contactez-nous :\n📞 +212 663-176838\n📧 ibebuilds@gmail.com");
            }, 500);
            return;
        }

        // Show typing indicator
        this.showTypingIndicator();

        try {
            const response = await this.callGeminiAPI(message);
            this.hideTypingIndicator();
            this.addBotMessage(response);
        } catch (error) {
            this.hideTypingIndicator();
            console.error('Gemini API Error:', error);
            this.addBotMessage("Désolé, je rencontre un problème technique. 😔\n\nPour une réponse immédiate :\n📞 +212 663-176838\n📧 ibebuilds@gmail.com\n💬 WhatsApp (bouton en bas à droite)");
        }
    }

    async callGeminiAPI(userMessage) {
        const requestBody = {
            contents: [{
                parts: [{
                    text: `${this.systemPrompt}\n\nUtilisateur: ${userMessage}\n\nAssistant:`
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 300,
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        };

        const response = await fetch(`${this.apiEndpoint}?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('Invalid API response');
        }
    }

    showTypingIndicator() {
        this.isTyping = true;
        const messagesContainer = document.getElementById('chatbot-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chatbot-message bot-message typing-indicator-wrapper';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        this.isTyping = false;
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    }

    addUserMessage(text) {
        this.messages.push({ type: 'user', text, timestamp: new Date() });
        this.renderMessage('user', text);
    }

    addBotMessage(text) {
        this.messages.push({ type: 'bot', text, timestamp: new Date() });
        this.renderMessage('bot', text);
    }

    renderMessage(type, text) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${type}-message`;

        // Convert line breaks to HTML
        const formattedText = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');

        messageDiv.innerHTML = `
            <div class="message-content">${formattedText}</div>
            <div class="message-time">${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
        `;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Initialize chatbot when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new IBEChatbot();
});
