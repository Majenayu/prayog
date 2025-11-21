import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
// Using OpenAI integration blueprint - see blueprint:javascript_openai for reference
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// OpenRouter as fallback when OpenAI quota is exceeded
const openrouter = process.env.OPENROUTER_API_KEY ? new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1"
}) : null;

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

export interface ExchangeAnalysisResult {
  // Product Identification
  productName: string;
  productType: string;
  manufacturer: string;
  partNumber: string;
  
  // Condition Assessment (from equipment photo)
  visualCondition: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  conditionScore: number; // 0-100 VCI
  detectedIssues: string[];
  
  // Bill Data Extraction
  originalPrice: number;
  purchaseDate: string; // ISO date string
  materialType: string;
  
  // Predictive Analysis
  remainingUsefulLife: string;
  estimatedMarketValue: number;
  depreciationRate: number;
  usabilityStatus: 'usable' | 'service_recommended' | 'replace_immediately';
  
  // Metadata
  aiConfidence: number; // 0.00-1.00
  analysisReport: {
    summary: string;
    conditionDetails: string;
    billDataExtraction: string;
    valueEstimationReasoning: string;
    recommendations: string[];
  };
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

export async function analyzeEquipmentForExchange(
  equipmentImage: string,
  billImage: string
): Promise<ExchangeAnalysisResult> {
  if (!openai && !openrouter) {
    throw new Error("No AI API key is configured. Please set OPENAI_API_KEY or OPENROUTER_API_KEY environment variable.");
  }
  
  // Try OpenAI first, fallback to OpenRouter if quota exceeded
  let aiClient = openai;
  let model = "gpt-5";
  
  try {
    // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    if (!aiClient && openrouter) {
      aiClient = openrouter;
      model = "anthropic/claude-3.5-sonnet"; // Good vision model on OpenRouter
    }
    
    const visionResponse = await aiClient!.chat.completions.create({
      model: model,
      messages: [
        {
          role: "system",
          content: `You are a world-class industrial equipment expert combining expertise in:
1. Machine vision and component identification (YOLO/Mask R-CNN level object detection)
2. Condition assessment and wear analysis (ResNet/ViT level classification)
3. OCR and document extraction (BERT-level NER)
4. Asset valuation and depreciation modeling (XGBoost/LGBM regression)
5. Remaining Useful Life (RUL) prediction (LSTM time series analysis)

You analyze equipment photos and bills to provide comprehensive market valuation reports for industrial asset exchanges.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Perform a comprehensive multimodal analysis of this industrial equipment for the exchange marketplace. I'm providing two images:
1. Equipment Photo: Analyze the component to identify it and assess its condition
2. Bill/Invoice Photo: Extract purchase details and metadata

Your analysis must include:

**STEP 1: Component Detection & Identification** (from equipment photo)
- Identify the specific type of industrial component (e.g., "Tapered Roller Bearing", "CNC Insert", "Hydraulic Valve", etc.)
- Determine the exact product name and type
- Visual inspection for manufacturer markings or model numbers

**STEP 2: Condition Analysis** (from equipment photo)  
- Assess visible condition: excellent, good, fair, poor, or critical
- Calculate Visual Condition Indicator (VCI) score (0-100)
- Detect wear patterns: corrosion, pitting, cracks, deformation, contamination, etc.
- List all visible defects and issues

**STEP 3: Bill Data Extraction** (from bill/invoice photo)
- Extract: Part Number, Manufacturer, Original Price (USD), Purchase Date
- Identify material type and specifications
- Any warranty or certification details

**STEP 4: Predictive Analysis** (combining both)
- Calculate age from purchase date
- Estimate Remaining Useful Life (RUL) based on: age, condition, typical component lifespan
- Predict current market value using depreciation model considering:
  * Original price
  * Age factor
  * Condition factor (VCI score)
  * Market demand for this component type
  * Usability status
- Calculate depreciation rate
- Determine usability: usable, service_recommended, or replace_immediately

Provide your analysis in this exact JSON structure:
{
  "productName": "Full product name",
  "productType": "Component category (e.g., 'Tapered Roller Bearing')",
  "manufacturer": "Brand/manufacturer name",
  "partNumber": "Part/model number from bill",
  "visualCondition": "excellent" | "good" | "fair" | "poor" | "critical",
  "conditionScore": number (0-100 VCI score),
  "detectedIssues": ["issue 1", "issue 2"],
  "originalPrice": number (USD from bill),
  "purchaseDate": "YYYY-MM-DD" (from bill),
  "materialType": "Material composition",
  "remainingUsefulLife": "X years" or "X hours",
  "estimatedMarketValue": number (current USD value),
  "depreciationRate": number (percentage, e.g., 35.5 for 35.5%),
  "usabilityStatus": "usable" | "service_recommended" | "replace_immediately",
  "aiConfidence": number (0.00-1.00),
  "analysisReport": {
    "summary": "Brief 2-3 sentence overview",
    "conditionDetails": "Detailed condition assessment",
    "billDataExtraction": "What was extracted from the bill",
    "valueEstimationReasoning": "How the market value was calculated",
    "recommendations": ["recommendation 1", "recommendation 2"]
  }
}`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${equipmentImage}`,
                detail: "high"
              }
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${billImage}`,
                detail: "high"
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(visionResponse.choices[0].message.content || '{}');
    return result as ExchangeAnalysisResult;
  } catch (error: any) {
    // If OpenAI quota exceeded and OpenRouter is available, retry with OpenRouter
    if (error.message?.includes('429') && aiClient === openai && openrouter) {
      console.log('OpenAI quota exceeded, falling back to OpenRouter...');
      try {
        const fallbackResponse = await openrouter.chat.completions.create({
          model: "anthropic/claude-3.5-sonnet",
          messages: [
            {
              role: "system",
              content: `You are a world-class industrial equipment expert combining expertise in:
1. Machine vision and component identification (YOLO/Mask R-CNN level object detection)
2. Condition assessment and wear analysis (ResNet/ViT level classification)
3. OCR and document extraction (BERT-level NER)
4. Asset valuation and depreciation modeling (XGBoost/LGBM regression)
5. Remaining Useful Life (RUL) prediction (LSTM time series analysis)

You analyze equipment photos and bills to provide comprehensive market valuation reports for industrial asset exchanges.`
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Perform a comprehensive multimodal analysis of this industrial equipment for the exchange marketplace. I'm providing two images:
1. Equipment Photo: Analyze the component to identify it and assess its condition
2. Bill/Invoice Photo: Extract purchase details and metadata

Your analysis must include:

**STEP 1: Component Detection & Identification** (from equipment photo)
- Identify the specific type of industrial component (e.g., "Tapered Roller Bearing", "CNC Insert", "Hydraulic Valve", etc.)
- Determine the exact product name and type
- Visual inspection for manufacturer markings or model numbers

**STEP 2: Condition Analysis** (from equipment photo)  
- Assess visible condition: excellent, good, fair, poor, or critical
- Calculate Visual Condition Indicator (VCI) score (0-100)
- Detect wear patterns: corrosion, pitting, cracks, deformation, contamination, etc.
- List all visible defects and issues

**STEP 3: Bill Data Extraction** (from bill/invoice photo)
- Extract: Part Number, Manufacturer, Original Price (USD), Purchase Date
- Identify material type and specifications
- Any warranty or certification details

**STEP 4: Predictive Analysis** (combining both)
- Calculate age from purchase date
- Estimate Remaining Useful Life (RUL) based on: age, condition, typical component lifespan
- Predict current market value using depreciation model considering:
  * Original price
  * Age factor
  * Condition factor (VCI score)
  * Market demand for this component type
  * Usability status
- Calculate depreciation rate
- Determine usability: usable, service_recommended, or replace_immediately

Provide your analysis in this exact JSON structure:
{
  "productName": "Full product name",
  "productType": "Component category (e.g., 'Tapered Roller Bearing')",
  "manufacturer": "Brand/manufacturer name",
  "partNumber": "Part/model number from bill",
  "visualCondition": "excellent" | "good" | "fair" | "poor" | "critical",
  "conditionScore": number (0-100 VCI score),
  "detectedIssues": ["issue 1", "issue 2"],
  "originalPrice": number (USD from bill),
  "purchaseDate": "YYYY-MM-DD" (from bill),
  "materialType": "Material composition",
  "remainingUsefulLife": "X years" or "X hours",
  "estimatedMarketValue": number (current USD value),
  "depreciationRate": number (percentage, e.g., 35.5 for 35.5%),
  "usabilityStatus": "usable" | "service_recommended" | "replace_immediately",
  "aiConfidence": number (0.00-1.00),
  "analysisReport": {
    "summary": "Brief 2-3 sentence overview",
    "conditionDetails": "Detailed condition assessment",
    "billDataExtraction": "What was extracted from the bill",
    "valueEstimationReasoning": "How the market value was calculated",
    "recommendations": ["recommendation 1", "recommendation 2"]
  }
}`
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${equipmentImage}`,
                    detail: "high"
                  }
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${billImage}`,
                    detail: "high"
                  }
                }
              ],
            },
          ],
        });
        
        const fallbackResult = JSON.parse(fallbackResponse.choices[0].message.content || '{}');
        return fallbackResult as ExchangeAnalysisResult;
      } catch (fallbackError: any) {
        throw new Error(`AI exchange analysis failed with both OpenAI and OpenRouter: ${fallbackError.message}`);
      }
    }
    throw new Error(`AI exchange analysis failed: ${error.message}`);
  }
}
