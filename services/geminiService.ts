import { GoogleGenAI, Modality } from "@google/genai";

// Fix: Updated the interface to match the Gemini API response structure where 'web', 'uri', and 'title' can be optional.
interface GroundedResponse {
    text: string;
    groundingMetadata?: { groundingChunks: { web?: { uri?: string, title?: string } }[] }[];
}

export const generateGroundedResponse = async (prompt: string): Promise<GroundedResponse> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        return {
            text: response.text,
            groundingMetadata: response.candidates?.[0]?.groundingMetadata ? [response.candidates[0].groundingMetadata] : undefined
        };
    } catch (error) {
        console.error("Error generating grounded response:", error);
        throw new Error("Failed to communicate with the Gemini API for search.");
    }
};

export const generateSpeech = async (text: string): Promise<string | null> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Say this calmly: ${text}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (error) {
        console.error("Error generating speech:", error);
        throw new Error("Failed to communicate with the Gemini API for TTS.");
    }
};