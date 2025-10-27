import { GoogleGenAI, Type } from "@google/genai";
import type { Document, Agent } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const extractTextFromImage = async (base64Image: string, mimeType: string): Promise<string> => {
    const imagePart = {
        inlineData: {
            data: base64Image,
            mimeType,
        },
    };
    const textPart = {
        text: "Extract all text from this document image. Preserve the original formatting as much as possible.",
    };
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });
        return response.text;
    } catch (error) {
        console.error("Error extracting text from image:", error);
        throw new Error("Failed to extract text from the provided image.");
    }
};

export const generateSingleDocumentSummary = async (content: string, title: string): Promise<string> => {
    const prompt = `Summarize the following document titled "${title}". Focus on the key points, findings, and critical information. The summary should be concise and clear.
    
    **Document Content:**
    ${content}`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating single summary:", error);
        throw new Error("Failed to generate summary for the document.");
    }
};


export const generateComprehensiveSummary = async (summaries: { title: string, summary: string }[]): Promise<string> => {
    const combinedContent = summaries.map(s => `## ${s.title}\n\n${s.summary}`).join('\n\n---\n\n');
    const prompt = `You are an expert legal and regulatory analyst specializing in medical device manufacturing. Your task is to synthesize the following individual document summaries into a single, cohesive, and well-structured executive summary.

    **Instructions:**
    1.  Read all the provided summaries carefully.
    2.  Identify the most critical information, key findings, and main themes, weaving them together into a unified narrative.
    3.  Generate the final summary in Markdown format.
    4.  **Crucially, highlight all important keywords, dates, product names, and regulatory bodies using the format \`==highlighted text==\`.** This is essential for the user to quickly spot key information.
    5.  The summary should be professional and easy to understand for a stakeholder in the medical device industry.

    **Document Summaries:**
    ${combinedContent}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating comprehensive summary:", error);
        throw new Error("Failed to generate comprehensive summary.");
    }
};

export const extractData = async (documentContent: string): Promise<Record<string, any>> => {
    const prompt = `From the following document text, extract the specified data points.
    Return ONLY a valid JSON object with the specified keys. Do not include any other text or markdown formatting.

    **Document Text:**
    ${documentContent}`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        "委託者名稱": { type: Type.STRING },
                        "委託者地址": { type: Type.STRING },
                        "製造廠名稱": { type: Type.STRING },
                        "製造廠地址": { type: Type.STRING },
                        "醫療器材許可證字號": { type: Type.STRING },
                        "有效日期": { type: Type.STRING },
                    },
                },
            },
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error extracting data:", error);
        throw new Error("Failed to extract structured data.");
    }
};

export const executeAgent = async (context: string, agent: Agent): Promise<string> => {
    const fullPrompt = `**Context:**
    ${context}

    ---

    **Agent Task:**
    ${agent.prompt}`;

    try {
        const response = await ai.models.generateContent({
            model: agent.model,
            contents: fullPrompt,
        });
        return response.text;
    } catch (error) {
        console.error(`Error executing agent "${agent.name}":`, error);
        throw new Error(`Agent "${agent.name}" failed to execute.`);
    }
};

export const generateFollowUpQuestions = async (summary: string): Promise<string[]> => {
    const prompt = `Based on the comprehensive summary provided below, generate exactly three insightful and actionable follow-up questions. These questions should help a user probe deeper into the findings, address potential issues, or plan next steps. Return a valid JSON array of strings.

    **Comprehensive Summary:**
    ${summary}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                },
            },
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error generating follow-up questions:", error);
        throw new Error("Failed to generate follow-up questions.");
    }
};