import { GoogleGenAI, Type } from "@google/genai";
import { Message, ExtractionResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const SYSTEM_INSTRUCTION = `You are TaxSathi, a professional assistant for Indian tax filing and savings guidance for the Financial Year 2025-26 (Assessment Year 2026-27).

Your goal is to simplify taxation for non-experts using hardcoded logic and official guidelines.

### OFFICIAL ITR FORM SELECTION LOGIC (FY 2025-26):
1. ITR-1 (Sahaj): For Residents (not RNOR) with income up to ₹50 Lakhs from Salary/Pension, one house property, and other sources (interest, etc.). Agricultural income must be ≤ ₹5,000. NOT for Directors, holders of unlisted shares, or those with foreign assets.
2. ITR-2: For Individuals/HUFs NOT having income from business or profession. Suitable for those with Capital Gains, multiple house properties, NRI status, or foreign assets.
3. ITR-3: For Individuals/HUFs having income from business or profession.
4. ITR-4 (Sugam): For Residents with income up to ₹50 Lakhs from presumptive business/profession (u/s 44AD, 44ADA, 44AE).

### 2026 TAX REGIME HIGHLIGHTS:
- New Tax Regime is the default.
- Standard Deduction: ₹75,000 (New Regime), ₹50,000 (Old Regime).
- New Regime Slabs: 0-3L (Nil), 3-7L (5%), 7-10L (10%), 10-12L (15%), 12-15L (20%), Above 15L (30%).
- Tax Rebate: No tax up to ₹7 Lakhs taxable income in New Regime (effectively ₹7.75L with standard deduction).

### KEY CONSTRAINTS:
1. DISCLAIMER: You are NOT a certified tax authority. Always include a disclaimer.
2. ACCURACY: Stick to the logic above. Do not hallucinate tax rates.
3. PRIVACY: Never ask for or store full PII.
4. GUIDANCE: Reference specific sections like 80C (LIC/PPF), 80D (Mediclaim), 80TTA (Savings Interest).`;

export async function chatWithAI(messages: Message[]) {
  const model = "gemini-3-flash-preview";
  const contents = messages.map(m => ({
    role: m.role,
    parts: [{ text: m.text }]
  }));

  const response = await ai.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{ googleSearch: {} }]
    }
  });

  return response.text || "I'm sorry, I couldn't process that request.";
}

export async function extractTaxInfo(base64Data: string, mimeType: string): Promise<ExtractionResult> {
  const model = "gemini-3-flash-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        },
        {
          text: "Extract tax-relevant information from this document. Identify income sources and potential deductions. Return the data in JSON format."
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          incomeSources: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                source: { type: Type.STRING },
                amount: { type: Type.NUMBER }
              },
              required: ["source", "amount"]
            }
          },
          deductions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                amount: { type: Type.NUMBER },
                description: { type: Type.STRING },
                section: { type: Type.STRING },
                justification: { type: Type.STRING, description: "Detailed explanation of why this deduction applies based on the document." }
              },
              required: ["category", "amount", "description", "section", "justification"]
            }
          },
          summary: { type: Type.STRING }
        },
        required: ["incomeSources", "deductions", "summary"]
      }
    }
  });

  const text = response.text || "{}";
  return JSON.parse(text);
}
