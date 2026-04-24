import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef(null)
  const textareaRef = useRef(null)

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  const handleSend = async () => {
    if (!input.trim() || isTyping) return

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Call real n8n workflow
    connectToN8n(input)
  }

  const connectToN8n = async (userPrompt) => {
    const aiResponseId = Date.now() + 1
    const newAiMessage = {
      id: aiResponseId,
      role: 'assistant',
      content: '', // Will be updated
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, newAiMessage])

    try {
    const PROD_URL = 'https://ai-bot-bs546.loca.lt/webhook/ai-chat';
    const TEST_URL = 'https://ai-bot-bs546.loca.lt/webhook-test/ai-chat';

    let response;
    try {
      // 1. Try Production (Active) URL first
      response = await fetch(PROD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatInput: userPrompt, sessionId: "default-session" }),
      });
      
      if (!response.ok) throw new Error('Switching to test');
    } catch (e) {
      // 2. Fallback to Test (Listening) URL
      response = await fetch(TEST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatInput: userPrompt, sessionId: "default-session" }),
      });
    }

      if (!response.ok) throw new Error('Response not OK');

      const data = await response.json();
      
      // SUPER ROBUST PARSING: Look for any field that might be the answer
      const aiText = data.output || data.text || data.message || (typeof data === 'string' ? data : JSON.stringify(data));

      // Simulate streaming for the n8n response to keep the premium feel
      let currentText = ""
      let index = 0
      const interval = setInterval(() => {
        if (index < aiText.length) {
          currentText += aiText.charAt(index)
          setMessages(prev => 
            prev.map(msg => msg.id === aiResponseId ? { ...msg, content: currentText } : msg)
          )
          index++
        } else {
          clearInterval(interval)
          setIsTyping(false)
        }
      }, 5)

    } catch (error) {
      console.error("n8n Error:", error);
      setMessages(prev => 
        prev.map(msg => msg.id === aiResponseId ? { ...msg, content: "⚠️ Error: Could not reach your n8n workflow. Make sure n8n is running and the webhook is active." } : msg)
      )
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const suggestions = [
    { title: "Explain quantum computing", desc: "in simple terms" },
    { title: "Write a React component", desc: "for a sleek login page" },
    { title: "Brainstorm ideas", desc: "for a science fiction novel" },
    { title: "Optimize this code", desc: "for better performance" }
  ]

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <button className="new-chat-btn" onClick={() => setMessages([])}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Chat
        </button>
        
        <div className="history-list">
          <div className="history-item">How to use Vite?</div>
          <div className="history-item">React State Management</div>
          <div className="history-item">Modern CSS Techniques</div>
          <div className="history-item">Quantum Physics Intro</div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <div className="history-item">Settings</div>
          <div className="history-item">My Account</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="chat-main">
        <header className="chat-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>AI Assistant</span>
            <span className="llm-badge">GPT-4 PRO</span>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: 'pointer', opacity: 0.7 }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </div>
        </header>

        {messages.length === 0 ? (
          <div className="welcome-screen">
            <h1>What can I help with?</h1>
            <p>I'm your intelligent companion designed to boost your productivity. Ask me anything, or try a suggestion below.</p>
            
            <div className="suggestion-grid">
              {suggestions.map((s, i) => (
                <div key={i} className="suggestion-card" onClick={() => setInput(s.title + " " + s.desc)}>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="messages-container">
            {messages.map((message) => (
              <div key={message.id} className="message-wrapper" style={{ 
                backgroundColor: message.role === 'assistant' ? 'var(--ai-msg-bg)' : 'transparent' 
              }}>
                <div className="message-content">
                  <div className={`avatar ${message.role === 'user' ? 'user-avatar' : 'ai-avatar'}`}>
                    {message.role === 'user' ? 'U' : 'AI'}
                  </div>
                  <div className="text-content">
                    <div style={{ fontWeight: '600', marginBottom: '4px', fontSize: '0.85rem' }}>
                      {message.role === 'user' ? 'You' : 'Assistant'}
                      <span style={{ fontWeight: '400', opacity: 0.5, marginLeft: '8px' }}>{message.timestamp}</span>
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      {message.content}
                      {isTyping && message.id === messages[messages.length - 1].id && message.role === 'assistant' && (
                        <span className="typing-cursor"></span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        )}

        <div className="input-section">
          <div className="input-container-wrapper">
            <textarea
              ref={textareaRef}
              className="input-box"
              placeholder="Message AI Assistant..."
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button 
              className="send-btn" 
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '12px' }}>
            AI Assistant can make mistakes. Consider checking important information.
          </p>
        </div>
      </main>
    </div>
  )
}

export default App
