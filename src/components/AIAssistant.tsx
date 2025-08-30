import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Sparkles, FileText, Briefcase, TrendingUp } from 'lucide-react';
import { analyzeResumeWithGemini, getJobRecommendationsWithAI } from '../services/geminiService';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface AIAssistantProps {
  resumeData?: any;
  isLoggedIn: boolean;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ resumeData, isLoggedIn }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm Panda AI 🐼, your career assistant. I can help you analyze your resume, find jobs, and provide career advice. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    {
      icon: FileText,
      label: "Analyze Resume",
      action: () => handleQuickAction("analyze-resume")
    },
    {
      icon: Briefcase,
      label: "Find Jobs",
      action: () => handleQuickAction("find-jobs")
    },
    {
      icon: TrendingUp,
      label: "Career Tips",
      action: () => handleQuickAction("career-tips")
    }
  ];

  const handleQuickAction = async (action: string) => {
    let message = '';
    switch (action) {
      case 'analyze-resume':
        message = 'Please analyze my resume and provide feedback';
        break;
      case 'find-jobs':
        message = 'Help me find jobs that match my skills';
        break;
      case 'career-tips':
        message = 'Give me some career advancement tips';
        break;
    }
    
    if (message) {
      await handleSendMessage(message);
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputValue.trim();
    if (!text) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      let response = '';

      // Handle different types of queries
      if (text.toLowerCase().includes('analyze') || text.toLowerCase().includes('resume')) {
        if (resumeData) {
          const analysis = await analyzeResumeWithGemini(resumeData);
          response = `🎯 **Resume Analysis Complete!**\n\n**ATS Score:** ${analysis.atsScore}/100\n\n**Strengths:**\n${analysis.strengths.map(s => `• ${s}`).join('\n')}\n\n**Areas for Improvement:**\n${analysis.weaknesses.map(w => `• ${w}`).join('\n')}\n\n**Recommendations:**\n${analysis.suggestions.map(s => `• ${s}`).join('\n')}`;
        } else {
          response = "I'd love to analyze your resume! Please create or upload a resume first using the Resume Builder section.";
        }
      } else if (text.toLowerCase().includes('job') || text.toLowerCase().includes('career')) {
        if (isLoggedIn && resumeData?.skills) {
          const jobs = await getJobRecommendationsWithAI(resumeData.skills);
          response = `💼 **Job Recommendations Based on Your Skills:**\n\n${jobs.slice(0, 5).map((job, i) => `${i + 1}. **${job.title}** at ${job.company}\n   📍 ${job.location} | 💰 ${job.salary}\n   🎯 Match: ${job.matchScore}%\n`).join('\n')}`;
        } else if (!isLoggedIn) {
          response = "To get personalized job recommendations, please log in to access the Career Portal!";
        } else {
          response = "I need your resume data to provide job recommendations. Please create a resume first!";
        }
      } else if (text.toLowerCase().includes('tip') || text.toLowerCase().includes('advice')) {
        response = `💡 **Career Success Tips:**\n\n• **Optimize your LinkedIn profile** - Use keywords from job descriptions\n• **Build a portfolio** - Showcase your best work and projects\n• **Network actively** - Connect with professionals in your field\n• **Keep learning** - Stay updated with industry trends\n• **Quantify achievements** - Use numbers to show your impact\n• **Practice interviewing** - Prepare for common questions\n• **Follow up** - Send thank-you notes after interviews`;
      } else {
        // General AI response
        response = await getAIResponse(text);
      }

      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);
      }, 1000 + Math.random() * 1000);

    } catch (error) {
      console.error('AI Assistant error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'm having trouble processing your request right now. Please try again or contact support if the issue persists.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  const getAIResponse = async (query: string): Promise<string> => {
    // Simple rule-based responses for common queries
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('hello') || lowerQuery.includes('hi')) {
      return "Hello! 👋 I'm Panda AI, your personal career assistant. I'm here to help you with resume analysis, job searching, and career advice. What would you like to work on today?";
    }
    
    if (lowerQuery.includes('help')) {
      return "I can help you with:\n\n🔍 **Resume Analysis** - Get ATS scores and improvement suggestions\n💼 **Job Matching** - Find opportunities that match your skills\n📈 **Career Advice** - Tips for professional growth\n📝 **Resume Building** - Guidance on creating effective resumes\n🎯 **Interview Prep** - Common questions and best practices\n\nWhat would you like to explore?";
    }
    
    if (lowerQuery.includes('salary') || lowerQuery.includes('pay')) {
      return "💰 **Salary Insights:**\n\nSalary ranges vary by role, experience, and location:\n• **Entry Level (0-2 years):** ₹3-8 LPA\n• **Mid Level (2-5 years):** ₹8-20 LPA\n• **Senior Level (5+ years):** ₹20-50 LPA\n• **Leadership Roles:** ₹50+ LPA\n\nFactors affecting salary:\n• Technical skills and certifications\n• Company size and industry\n• Location (metro vs non-metro)\n• Negotiation skills\n\nWould you like specific salary data for your field?";
    }
    
    return "That's an interesting question! I'm here to help with career-related topics like resume building, job searching, and professional development. Could you tell me more about what specific career help you're looking for?";
  };

  const formatMessage = (content: string) => {
    // Convert markdown-like formatting to JSX
    const lines = content.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <div key={index} className="font-bold text-blue-600 dark:text-blue-400 mb-2 text-base">{line.slice(2, -2)}</div>;
      }
      if (line.startsWith('• ')) {
        return <div key={index} className="ml-4 mb-1 flex items-start space-x-2">
          <span className="text-blue-500 mt-1">•</span>
          <span>{line.slice(2)}</span>
        </div>;
      }
      if (line.match(/^\d+\./)) {
        return <div key={index} className="mb-1 font-medium text-purple-600 dark:text-purple-400">{line}</div>;
      }
      return line ? <div key={index} className="mb-1 leading-relaxed">{line}</div> : <div key={index} className="mb-2"></div>;
    });
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-20 h-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-full shadow-2xl flex items-center justify-center text-white transition-all duration-300 group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2, type: "spring" }}
      >
        <div className="relative flex flex-col items-center">
          <motion.div 
            className="text-3xl mb-1"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            🐼
          </motion.div>
          <div className="text-xs font-bold opacity-90 group-hover:opacity-100 transition-opacity">
            AI
          </div>
          <motion.div
            className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-3 border-white flex items-center justify-center"
            animate={{ 
              scale: [1, 1.3, 1],
              boxShadow: ["0 0 0 0 rgba(34, 197, 94, 0.7)", "0 0 0 10px rgba(34, 197, 94, 0)", "0 0 0 0 rgba(34, 197, 94, 0)"]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100 }}
            className="fixed bottom-28 right-6 z-50 w-96 h-[650px] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden backdrop-blur-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
              backdropFilter: 'blur(20px)'
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 text-white flex items-center justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse" />
              <div className="flex items-center space-x-3">
                <motion.div 
                  className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <motion.span 
                    className="text-2xl"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🐼
                  </motion.span>
                </motion.div>
                <div>
                  <h3 className="font-bold text-lg">Panda AI Assistant</h3>
                  <div className="flex items-center space-x-2">
                    <motion.div
                      className="w-2 h-2 bg-green-400 rounded-full"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <p className="text-xs opacity-90">Online & Ready to Help</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
              <div className="grid grid-cols-3 gap-2">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={index}
                    onClick={action.action}
                    className="flex flex-col items-center space-y-1 bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300 px-2 py-3 rounded-xl text-xs hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all shadow-sm border border-blue-100 dark:border-blue-800"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <action.icon className="w-4 h-4" />
                    <span className="font-medium">{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-800/50 dark:to-gray-900">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <motion.div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                        : 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white border-2 border-white/20'
                    }`}
                      whileHover={{ scale: 1.1 }}
                    >
                      {message.type === 'user' ? (
                        <User className="w-5 h-5" />
                      ) : (
                        <motion.span 
                          className="text-lg"
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          🐼
                        </motion.span>
                      )}
                    </motion.div>
                    <motion.div 
                      className={`p-4 rounded-2xl shadow-lg ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md border border-blue-400'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md border border-gray-200 dark:border-gray-700'
                    }`}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="text-sm whitespace-pre-line">
                        {typeof message.content === 'string' ? formatMessage(message.content) : message.content}
                      </div>
                      <div className="text-xs opacity-70 mt-2 font-medium">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start space-x-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg border-2 border-white/20">
                      <motion.span 
                        className="text-lg"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        🐼
                      </motion.span>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-bl-md shadow-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Panda AI is thinking...</span>
                      </div>
                      <div className="flex space-x-2">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                            animate={{ 
                              scale: [1, 1.5, 1],
                              opacity: [0.5, 1, 0.5]
                            }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
              <div className="flex space-x-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me anything about your career..."
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm placeholder-gray-400 dark:placeholder-gray-500"
                />
                <motion.button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-3 rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send className="w-5 h-5" strokeWidth={2} />
                </motion.button>
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                Powered by AI • Press Enter to send
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;