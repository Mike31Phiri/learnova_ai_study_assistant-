import { supabase } from './supabaseClient';
import { Message, ChatSession, MessageRole } from '../types';

export const dbService = {
  // Fetch all chat sessions for a user
  async getChats(userId: string): Promise<ChatSession[]> {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching chats:', error);
      return [];
    }

    return data.map((chat: any) => ({
      id: chat.id,
      title: chat.title,
      messages: [], // Messages are loaded on demand
      timestamp: new Date(chat.updated_at).getTime()
    }));
  },

  // Fetch full messages for a specific chat
  async getMessages(chatId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return data.map((msg: any) => ({
      id: msg.id,
      role: msg.role as MessageRole,
      text: msg.content,
      attachments: msg.attachments || [],
      timestamp: new Date(msg.created_at).getTime(),
      feedback: msg.feedback
    }));
  },

  // Create a new chat session
  async createChat(userId: string, title: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('chats')
      .insert([{ user_id: userId, title }])
      .select()
      .single();

    if (error) {
      console.error('Error creating chat:', error);
      return null;
    }
    return data.id;
  },

  // Update chat title
  async updateChatTitle(chatId: string, title: string) {
    await supabase.from('chats').update({ title }).eq('id', chatId);
  },

  // Save a message to the database
  async addMessage(chatId: string, message: Message) {
    const { error } = await supabase
      .from('messages')
      .insert([{
        chat_id: chatId,
        role: message.role,
        content: message.text,
        attachments: message.attachments, // Storing attachments as JSONB
        created_at: new Date(message.timestamp).toISOString()
      }]);

    if (error) {
      console.error('Error saving message:', error);
    } else {
      // Update the chat's 'updated_at' timestamp
      await supabase
        .from('chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId);
    }
  },

  // Delete a specific chat
  async deleteChat(chatId: string) {
    await supabase.from('chats').delete().eq('id', chatId);
  },

  // Clear all history for a user
  async clearHistory(userId: string) {
    await supabase.from('chats').delete().eq('user_id', userId);
  }
};