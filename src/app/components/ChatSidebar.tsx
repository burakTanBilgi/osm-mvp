"use client";
import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, MapPin, Mic, MicOff } from "lucide-react";

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatSidebarProps {
  onSearchLocation?: (query: string) => void;
  locationName?: string | null;
  isLoading?: boolean;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  onSearchLocation,
  locationName,
  isLoading = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hi there! Ask me about any location you want to see on the map.",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [isClient, setIsClient] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  const expandedWidth = "w-96"; // 24rem
  const collapsedWidth = "w-16"; // 4rem

  // Initialize speech recognition
useEffect(() => {
  setIsClient(true);
  
  if (typeof window !== 'undefined') {
    // Don't use type annotations here - access as plain browser API
    const SpeechRecognitionAPI = window.SpeechRecognition || 
                                window.webkitSpeechRecognition;
    
    if (SpeechRecognitionAPI) {
      setSpeechSupported(true);
      recognitionRef.current = new SpeechRecognitionAPI();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'tr-TR';
        
        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setMessage(transcript);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
        
        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error', event);
          setIsListening(false);
        };
      }
    }
  }
  
  return () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };
}, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setMessage("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSend = () => {
    if (message.trim()) {
      // Add user message
      setMessages([
        ...messages,
        {
          text: message,
          isUser: true,
          timestamp: new Date(),
        },
      ]);

      // If integrated with map, call the search function
      if (onSearchLocation) {
        onSearchLocation(message);
      } else {
        // Simulate response if not integrated
        setTimeout(() => {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              text: `I'll look for "${message}" on the map for you.`,
              isUser: false,
              timestamp: new Date(),
            },
          ]);
        }, 1000);
      }
      
      setMessage("");
    }
  };

  // Add a system message when location changes
  useEffect(() => {
    if (locationName && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      // Only add if this is a new location and not a duplicate message
      if (!(lastMessage.text.includes(locationName) && !lastMessage.isUser)) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: `I've found ${locationName} and marked it on the map.`,
            isUser: false,
            timestamp: new Date(),
          },
        ]);
      }
    }
  }, [locationName]); // Removed 'messages' from dependency array to fix duplicate messages

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when sidebar expands
  useEffect(() => {
    if (isExpanded) {
      inputRef.current?.focus();
    }
  }, [isExpanded]);

  return (
    <div
      className={`fixed top-0 right-0 h-full bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ease-in-out flex flex-col ${
        isExpanded ? expandedWidth : collapsedWidth
      } z-[10000]`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <h2
          className={`text-lg font-bold ${
            isExpanded ? "opacity-100" : "opacity-0"
          } transition-opacity duration-300`}
        >
          Map Assistant
        </h2>
      </div>

      {/* Messages */}
      <div
        className={`flex-grow overflow-y-auto p-4 ${
          isExpanded ? "opacity-100" : "opacity-0"
        } transition-opacity duration-300`}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-4 ${
              msg.isUser ? "flex flex-row-reverse" : "flex flex-row"
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                msg.isUser
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              }`}
            >
              <p>{msg.text}</p>
              {isClient ? (
                <p
                  className={`text-xs mt-1 ${
                    msg.isUser ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              ) : null}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className={`p-4 border-t dark:border-gray-700 ${
          isExpanded ? "opacity-100" : "opacity-0"
        } transition-opacity duration-300`}
      >
        <div className="flex items-center">
          <input
            ref={inputRef}
            type="text"
            placeholder={isListening ? "Listening..." : "Ask about a location..."}
            className={`flex-grow p-2 border rounded-l-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isListening ? "bg-red-50 dark:bg-red-900/20" : ""
            }`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!isExpanded || isLoading || isListening}
          />
          
          {/* Speech recognition button */}
          {speechSupported && (
            <button
              onClick={toggleListening}
              disabled={!isExpanded || isLoading}
              className={`p-2 ${
                isListening 
                  ? "bg-red-500 hover:bg-red-600" 
                  : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500"
              } text-white`}
              title={isListening ? "Stop listening" : "Start voice input"}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} className="text-gray-600 dark:text-gray-300" />}
            </button>
          )}
          
          {/* Send button */}
          <button
            className={`text-white p-2 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isLoading 
                ? "bg-gray-400" 
                : "bg-blue-500 hover:bg-blue-600"
            }`}
            onClick={handleSend}
            disabled={!isExpanded || !message.trim() || isLoading || isListening}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>

      {/* Collapsed state indicator when sidebar is collapsed */}
      {!isExpanded && (
        <div className="absolute top-20 right-4">
          {isLoading && (
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
          )}
          {locationName && !isLoading && (
            <div className="bg-blue-500 text-white p-1 rounded-full">
              <MapPin size={16} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatSidebar;