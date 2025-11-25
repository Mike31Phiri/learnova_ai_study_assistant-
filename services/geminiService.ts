import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Attachment, AttachmentType, UserProfile } from "../types";

// Initialize the client with the environment variable API key
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateChatTitle = async (context: string): Promise<string> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [{ 
          text: `Create a short, creative, and academic title (max 6 words) for a study session based on this initial user query: "${context}". 
          Examples of style: "Quantum Physics Intro", "Economic Supply Chains", "Literary Analysis of Hamlet".
          Do not use quotes. Return ONLY the title text.` 
        }]
      }
    });
    return response.text?.trim() || "Study Session";
  } catch (error) {
    console.error("Failed to generate title", error);
    // Fallback if API fails
    return context.length > 20 ? context.substring(0, 20) + '...' : (context || "New Study Session");
  }
};

export const sendMessageToGemini = async (
  text: string,
  attachments: Attachment[],
  userProfile?: UserProfile
): Promise<string> => {
  try {
    const parts: any[] = [];

    // Add attachments first so the model has context before the prompt
    for (const att of attachments) {
      parts.push({
        inlineData: {
          mimeType: att.mimeType,
          data: att.base64,
        },
      });
    }

    // Add text prompt
    if (text.trim()) {
      parts.push({ text: text });
    } else if (attachments.length > 0) {
      // If no text is provided but attachments exist, ask the model to describe/analyze them
      parts.push({ text: "Analyze this material and extract the core concepts needed to master this topic." });
    }

    if (parts.length === 0) {
      throw new Error("No content to send");
    }

    // Construct system instruction based on the "D to A+ Student" methodology
    let systemInstruction = `You are an elite academic performance coach designed to turn any student into an A+ student in record time. 
    
    CRITICAL SCOPE INSTRUCTION:
    You are strictly an educational and academic assistant. 
    - If the user asks about non-educational topics (e.g., sports scores, celebrity gossip, entertainment news, casual chit-chat unrelated to learning), politely decline by saying: "I am specialized exclusively as an academic coach and cannot assist with non-educational topics. Let's get back to your studies—what would you like to learn today?"
    - Exception: You may discuss "business" or "career" topics if they relate to academic study (e.g. Business Administration, Economics, Career paths for a degree).

    Your teaching methodology is strictly based on these proven learning science principles:
    1. **First Principles Thinking**: Don't just give answers. Break complex problems down to their most basic elements (Core Concepts) and build up from there.
    2. **Real-World Context**: ALWAYS provide a concrete, real-world application or example for every abstract concept. Theory without context is useless.
    3. **The Feynman Technique**: Explain concepts simply and clearly, as if teaching a smart 12-year-old. Avoid jargon unless you define it immediately.
    4. **Scaffolding & Connection**: Connect new information to things the student likely already knows. Use analogies heavily.
    5. **Visual Structuring (Mind Maps)**: When explaining systems or relationships, use text-based Mind Maps (using Markdown hierarchies, bullet points, or ASCII art) to visualize the structure.
    6. **The 80/20 Rule**: Focus heavily on the 20% of the material that will result in 80% of the grade. Identify high-yield topics.

    Format your responses to be visually scannable. Use bolding for key terms.
    `;
    
    if (userProfile?.program) {
      systemInstruction += `\n\nTHE STUDENT CONTEXT:
      The user is studying **${userProfile.program}** at **${userProfile.university || 'University'}**. 
      Tailor all examples, analogies, and applications to be relevant to a student in this specific field. 
      For example, if they are studying Economics, explain concepts using money, markets, or incentives.`;
    }

    // Use gemini-2.5-flash for best multimodal performance
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: parts
      },
      config: {
        // System instruction to ensure the model behaves as a helpful reader/analyst with context
        systemInstruction: systemInstruction
      }
    });

    return response.text || "No response generated.";

  } catch (error) {
    console.error("Gemini API Error Details:", error);
    throw error;
  }
};