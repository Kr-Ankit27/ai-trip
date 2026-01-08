import { GoogleGenAI, Type } from '@google/genai';

const API_KEYS = [
  import.meta.env.VITE_GOOGLE_GEMINI_AI_API_KEY,
  import.meta.env.VITE_GOOGLE_GEMINI_AI_API_KEY_2,
  import.meta.env.VITE_GOOGLE_GEMINI_AI_API_KEY_3
].filter(Boolean);

// The "Ultra-Failover" model priority list
const MODEL_PRIORITY = [
  'gemini-2.5-flash',
];

/**
 * Helper: Extract JSON from messy string responses
 */
function extractJSON(text) {
  if (!text) return '';
  const trimmed = text.trim();

  // 1. Check for specific Markdown code block (common with chatty models)
  const codeBlockMatch = trimmed.match(/```json\s*([\s\S]*?)\s*```/) || trimmed.match(/```\s*([\s\S]*?)\s*```/);
  const candidateText = codeBlockMatch ? codeBlockMatch[1] : trimmed;

  try {
    JSON.parse(candidateText);
    return candidateText.trim();
  } catch (e) {
    // 2. Scan for any block starting with '{' and ending with '}'
    const start = candidateText.indexOf('{');
    const end = candidateText.lastIndexOf('}');

    if (start !== -1 && end !== -1) {
      const block = candidateText.substring(start, end + 1);
      try {
        JSON.parse(block);
        console.log("📝 Successfully extracted JSON block.");
        return block;
      } catch (e2) {
        console.warn("⚠️ AI returned malformed JSON block:", block.slice(0, 50) + "...");
      }
    }

    // 3. Fallback: If no valid JSON block found, return trimmed text 
    // components should handle the catch themselves.
    return candidateText.trim();
  }
}

/**
 * NEW: Nested Failover Core
 * Tries every Key, and for each key tries every Model version.
 */
async function executeWithUltraFailover(operationFn) {
  if (API_KEYS.length === 0) throw new Error("No API Keys configured.");

  let lastError = null;

  for (let keyIdx = 0; keyIdx < API_KEYS.length; keyIdx++) {
    const apiKey = API_KEYS[keyIdx];
    const ai = new GoogleGenAI({ apiKey });

    for (let modelIdx = 0; modelIdx < MODEL_PRIORITY.length; modelIdx++) {
      const modelName = MODEL_PRIORITY[modelIdx];

      try {
        console.log(`🤖 Trial: Key #${keyIdx + 1}, Model: ${modelName}...`);
        const rawResponse = await operationFn(ai, modelName);
        console.log("✅ AI Success!");
        return rawResponse;
      } catch (error) {
        const msg = error.message?.toLowerCase() || '';

        if (msg.includes('429')) {
          console.warn(`🛑 Quota Exhausted for ${modelName} on Key #${keyIdx + 1}. Trying next MODEL on same key.`);
          lastError = error;
          continue; // Try next model version (Lite or 3.0) which might have separate quota
        } else if (msg.includes('404') || msg.includes('not found') || msg.includes('not recognised')) {
          console.warn(`❓ Model "${modelName}" not recognized on Key #${keyIdx + 1}. Trying next MODEL.`);
          lastError = error;
          continue; // Try next model on SAME key
        } else {
          console.error(`❌ Unexpected Error (${modelName}):`, error.message);
          lastError = error;
          continue;
        }
      }
    }
  }

  // If we get here, everything failed
  const isQuota = lastError?.message?.includes('429');
  throw new Error(isQuota ? "All keys hit their limits! Please wait ~60s." : "All AI fallbacks failed. Check connection/keys.");
}

const travelPlanSchema = {
  type: Type.OBJECT,
  properties: {
    location: { type: Type.STRING },
    best_time_to_visit: { type: Type.STRING },
    travel_plan: {
      type: Type.OBJECT,
      properties: {
        duration: { type: Type.STRING },
        budget_category: { type: Type.STRING },
        hotel_options: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              address: { type: Type.STRING },
              pricing_per_night_approx: {
                type: Type.OBJECT,
                properties: {
                  min: { type: Type.STRING },
                  max: { type: Type.STRING }
                },
                required: ['min', 'max']
              },
              rating: { type: Type.STRING },
              description: { type: Type.STRING },
              image_url: { type: Type.STRING }
            }
          }
        },
        itinerary: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.NUMBER },
              title: { type: Type.STRING },
              plan: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    activity: { type: Type.STRING },
                    description: { type: Type.STRING },
                    time_of_day: { type: Type.STRING },
                    travel_time: { type: Type.STRING },
                    ticket_pricing_approx: { type: Type.STRING },
                    image_url: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      },
      required: ['duration', 'budget_category', 'hotel_options', 'itinerary'],
    }
  },
  required: ['location', 'best_time_to_visit', 'travel_plan'],
};

export async function chat(history, userMessage) {
  return executeWithUltraFailover(async (ai, modelName) => {
    const isPlan = userMessage.toLowerCase().includes('travel plan');
    const generationConfig = {
      responseMimeType: 'application/json',
      responseSchema: isPlan ? travelPlanSchema : undefined,
    };

    const result = await ai.models.generateContentStream({
      model: modelName,
      generationConfig,
      systemInstruction: "You are a professional travel agent. Return ONLY JSON. STRICTLY include 'hotel_options' (with pricing_per_night_approx as an object containing min and max strings) and a complete 'itinerary'. The 'itinerary' MUST be an array of day objects. Each day object MUST have a 'plan' array of activities. DO NOT return a flat list of activities in the itinerary.",
      contents: [...history, { role: 'user', parts: [{ text: userMessage + " \n\nIMPORTANT: Return ONLY the raw JSON object. Use the exact keys 'activity' and 'description' for itinerary items. The 'itinerary' must be an array of day objects, and each day object must contain a 'plan' array of activities. Do not include any text before or after the JSON." }] }],
    });

    const stream = result.stream || result;
    let fullText = '';
    for await (const chunk of stream) {
      if (typeof chunk.text === 'function') fullText += chunk.text();
      else if (typeof chunk.text === 'string') fullText += chunk.text;
      else if (chunk.candidates?.[0]?.content?.parts?.[0]?.text) fullText += chunk.candidates[0].content.parts[0].text;
    }
    return extractJSON(fullText);
  });
}

/**
 * NEW: Suggest destinations based on user preferences
 */
export async function suggestDestinations(preferences) {
  const prompt = `You are a travel expert. Based on these user preferences, suggest exactly 5 diverse destinations from different continents:

Climate Preference: ${preferences.climate}
Travel Vibe: ${preferences.vibe}
Budget Style: ${preferences.budget}
Travel Pace: ${preferences.pace}
Crowd Preference: ${preferences.crowd}

Return ONLY a valid JSON array with this EXACT structure (no additional text):
[
  {
    "destination": "City, Country",
    "matchScore": 95,
    "reason": "Brief explanation why this destination perfectly matches their preferences (2-3 sentences)",
    "bestMonths": "Month-Month (e.g., Dec-Feb)",
    "highlightActivity": "One iconic activity or attraction"
  }
]

CRITICAL RULES:
- Return EXACTLY 5 destinations
- Ensure destinations are diverse (different continents/regions)
- Match scores should be between 85-99
- Keep reasons concise but compelling
- Use real, popular destinations
- NO markdown, NO code blocks, ONLY the JSON array`;

  return executeWithUltraFailover(async (ai, modelName) => {
    const result = await ai.models.generateContentStream({
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json',
      },
      systemInstruction: "You are a travel expert. Return ONLY valid JSON arrays. No markdown, no explanations.",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const stream = result.stream || result;
    let fullText = '';
    for await (const chunk of stream) {
      if (typeof chunk.text === 'function') fullText += chunk.text();
      else if (typeof chunk.text === 'string') fullText += chunk.text;
      else if (chunk.candidates?.[0]?.content?.parts?.[0]?.text) fullText += chunk.candidates[0].content.parts[0].text;
    }

    const cleanedJSON = extractJSON(fullText);
    return JSON.parse(cleanedJSON);
  });
}

