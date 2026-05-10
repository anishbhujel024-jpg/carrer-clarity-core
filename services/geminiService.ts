
import { GoogleGenAI, Type } from "@google/genai";
import { CareerAnalysis } from "../types";
import { assertGeminiApiKey, getAnalysisModel, openAiStudioKeySelector } from "./geminiConfig";

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    matchScore: { type: Type.NUMBER, description: "Skills-based alignment score (0-100)" },
    readinessScore: { type: Type.NUMBER, description: "Experience and maturity based readiness score (0-100)" },
    badge: { type: Type.STRING },
    experience: {
      type: Type.OBJECT,
      properties: {
        detected: { type: Type.NUMBER },
        required: { type: Type.NUMBER },
        description: { type: Type.STRING },
      },
      required: ["detected", "required", "description"],
    },
    education: {
      type: Type.OBJECT,
      properties: {
        detected: { type: Type.ARRAY, items: { type: Type.STRING } },
        verified: { type: Type.BOOLEAN },
        status: { type: Type.STRING },
      },
      required: ["detected", "verified", "status"],
    },
    radarData: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          subject: { type: Type.STRING },
          userScore: { type: Type.NUMBER },
          requiredScore: { type: Type.NUMBER },
        },
        required: ["subject", "userScore", "requiredScore"],
      },
    },
    strongSkills: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          level: { type: Type.NUMBER },
        },
        required: ["name", "level"],
      },
    },
    skillsGap: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          skill: { type: Type.STRING },
          importance: { type: Type.STRING },
          learningTime: { type: Type.STRING },
          difficulty: { type: Type.STRING },
          resourceLink: { type: Type.STRING },
        },
        required: ["skill", "importance", "learningTime", "difficulty", "resourceLink"],
      },
    },
    jobReadiness: {
      type: Type.OBJECT,
      properties: {
        progress: { type: Type.NUMBER },
        estimatedMonths: { type: Type.NUMBER },
      },
      required: ["progress", "estimatedMonths"],
    },
    actionPlan: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          week: { type: Type.NUMBER },
          focus: { type: Type.STRING },
          tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
          resources: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                skillToAcquire: { type: Type.STRING },
                type: { type: Type.STRING },
                url: { type: Type.STRING },
                estimatedTime: { type: Type.STRING },
                rationale: { type: Type.STRING }
              },
              required: ["name", "skillToAcquire", "type", "url", "estimatedTime", "rationale"]
            }
          }
        },
        required: ["week", "focus", "tasks", "resources"],
      },
    },
    priorityLearningPath: { type: Type.ARRAY, items: { type: Type.STRING } },
    marketInsights: {
      type: Type.OBJECT,
      properties: {
        demandIntensity: { type: Type.NUMBER },
        salaryRange: {
          type: Type.OBJECT,
          properties: {
            min: { type: Type.STRING },
            max: { type: Type.STRING },
            currency: { type: Type.STRING },
          },
          required: ["min", "max", "currency"],
        },
        marketSentiment: { type: Type.STRING },
        pivotRoles: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["demandIntensity", "salaryRange", "marketSentiment", "pivotRoles"],
    },
    alternativePaths: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          role: { type: Type.STRING },
          rationale: { type: Type.STRING },
          synergyScore: { type: Type.NUMBER },
        },
        required: ["role", "rationale", "synergyScore"],
      },
    },
    sources: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          uri: { type: Type.STRING },
        },
        required: ["title", "uri"],
      },
    },
  },
  required: [
    "matchScore", "readinessScore", "badge", "experience", "education", "radarData", 
    "strongSkills", "skillsGap", "jobReadiness", "actionPlan", 
    "priorityLearningPath", "marketInsights", "alternativePaths", "sources"
  ],
};

export async function analyzeResume(
  fileBase64: string, 
  mimeType: string, 
  role: string, 
  preferFree: boolean = true
): Promise<CareerAnalysis> {
  // Fresh instance inside the function to capture potential key updates
  const ai = new GoogleGenAI({ apiKey: assertGeminiApiKey() });
  
  // Upgrade to Pro for complex resume reasoning
  const model = getAnalysisModel();
  
  const prompt = `
    Analyze this professional dossier for the role: "${role}".
    1. Assess skill alignment (matchScore) and professional maturity (readinessScore).
    2. Use Google Search to verify 2025 market salary for this specific role.
    3. Generate a tactical 30-day action plan with live learning resources.
    4. Suggest 3 alternative pivot paths.
    Return the response strictly as JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { data: fileBase64, mimeType: mimeType } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        tools: [{ googleSearch: {} }] 
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI Engine.");
    return JSON.parse(text) as CareerAnalysis;
  } catch (error: any) {
    const errorMsg = error?.message || "";
    console.error("Gemini Service Exception:", error);

    // Specific handler for "Entity Not Found" (Paid key requirement) or Unauthorized
    if (
      errorMsg.includes("Requested entity was not found") || 
      errorMsg.includes("403") || 
      errorMsg.includes("401") ||
      errorMsg.includes("API_KEY_INVALID")
    ) {
      await openAiStudioKeySelector();
      throw new Error("AUTHORIZATION_REQUIRED: Your terminal requires a valid API Key from a paid project. Please select one now.");
    }

    throw new Error(errorMsg || "Network saturation: AI link refused connection.");
  }
}
