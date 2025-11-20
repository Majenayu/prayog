import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
// Using OpenAI integration blueprint - see blueprint:javascript_openai for reference
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export interface AIAppraisalResult {
  estimatedValue: number;
  conditionScore: number;
  conditionFactor: number;
  ageFactor: number;
  marketDemand: 'high' | 'medium' | 'low';
  mlConfidence: number;
  imageAnalysis: {
    defects: string[];
    quality_score: number;
    wear_indicators: string[];
    maintenance_needs: string[];
  };
  notes: string;
}

export interface AIHealthReportResult {
  overallCondition: 'excellent' | 'good' | 'fair' | 'poor';
  conditionScore: number;
  visualInspection: string;
  functionalTest: string;
  wearAndTear: string;
  defects: string[];
  estimatedLifeRemaining: string;
}

export async function analyzeItemImage(
  base64Image: string,
  itemDetails: {
    name: string;
    category: string;
    machineType?: string;
    purchaseDate?: Date;
    pricePerDay: string;
  }
): Promise<AIAppraisalResult> {
  if (!openai) {
    throw new Error("OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.");
  }
  
  try {
    // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are an expert industrial equipment appraiser with deep knowledge of machinery valuation, condition assessment, and market analysis. Analyze equipment images and provide detailed appraisals in JSON format.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this ${itemDetails.category} equipment image and provide a comprehensive appraisal. Item details:
- Name: ${itemDetails.name}
- Category: ${itemDetails.category}
${itemDetails.machineType ? `- Machine Type: ${itemDetails.machineType}` : ''}
${itemDetails.purchaseDate ? `- Purchase Date: ${itemDetails.purchaseDate.toISOString().split('T')[0]}` : ''}
- Current Rental Price: $${itemDetails.pricePerDay}/day

Provide a JSON response with the following structure:
{
  "estimatedValue": number (estimated market value in USD),
  "conditionScore": number (0-100 scale),
  "conditionFactor": number (0.00-1.00, where 1.00 is brand new),
  "ageFactor": number (0.00-1.00, accounting for age and obsolescence),
  "marketDemand": "high" | "medium" | "low",
  "mlConfidence": number (0.00-1.00, your confidence in this assessment),
  "imageAnalysis": {
    "defects": ["list of visible defects or damage"],
    "quality_score": number (0-100),
    "wear_indicators": ["signs of wear and tear"],
    "maintenance_needs": ["recommended maintenance items"]
  },
  "notes": "detailed analysis summary"
}`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(visionResponse.choices[0].message.content || '{}');
    return result as AIAppraisalResult;
  } catch (error: any) {
    throw new Error(`AI appraisal failed: ${error.message}`);
  }
}

export async function generateHealthReport(
  base64Image: string,
  itemDetails: {
    name: string;
    category: string;
    machineType?: string;
    purchaseDate?: Date;
  }
): Promise<AIHealthReportResult> {
  if (!openai) {
    throw new Error("OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.");
  }
  
  try {
    // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are a certified industrial equipment inspector specializing in machinery health assessment and predictive maintenance. Analyze equipment images and provide detailed health reports in JSON format.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Conduct a comprehensive health inspection of this ${itemDetails.category} equipment from the image. Item details:
- Name: ${itemDetails.name}
- Category: ${itemDetails.category}
${itemDetails.machineType ? `- Machine Type: ${itemDetails.machineType}` : ''}
${itemDetails.purchaseDate ? `- Purchase Date: ${itemDetails.purchaseDate.toISOString().split('T')[0]}` : ''}

Provide a JSON response with the following structure:
{
  "overallCondition": "excellent" | "good" | "fair" | "poor",
  "conditionScore": number (0-100 scale),
  "visualInspection": "detailed visual inspection findings",
  "functionalTest": "assessment of functional capabilities based on visible condition",
  "wearAndTear": "analysis of wear patterns and degradation",
  "defects": ["list of detected defects or issues"],
  "estimatedLifeRemaining": "estimated remaining operational life (e.g., '3 years', '1000 hours')"
}`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(visionResponse.choices[0].message.content || '{}');
    return result as AIHealthReportResult;
  } catch (error: any) {
    throw new Error(`AI health report generation failed: ${error.message}`);
  }
}
