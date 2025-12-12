import { useState, useRef, useEffect } from 'react';
import './Chat.css';

function Chat({ messages, onSendGuess, isDrawer, currentWord }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!input.trim() || isDrawer) return;
    
    onSendGuess(input.trim());
    setInput('');
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>💬 Chat</h3>
        {isDrawer && currentWord && (
          <div className="word-display">
            Your word: <strong>{currentWord}</strong>
          </div>
        )}
      </div>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${msg.isSystem ? 'system' : ''} ${msg.isCorrect ? 'correct' : ''}`}
          >
            {!msg.isSystem && <span className="message-author">{msg.playerName}:</span>}
            <span className="message-text">{msg.message}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isDrawer ? "You're drawing..." : "Type your guess..."}
          disabled={isDrawer}
          maxLength={50}
          className="chat-input"
        />
        <button type="submit" disabled={isDrawer || !input.trim()} className="send-btn">
          Send
        </button>
      </form>
    </div>
  );
}

export default Chat;
