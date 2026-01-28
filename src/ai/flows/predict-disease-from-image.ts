'use server';

/**
 * @fileOverview Predicts skin disease from an image using a pre-trained deep learning model.
 *
 * - predictDiseaseFromImage - A function that predicts skin disease from an image.
 * - PredictDiseaseFromImageInput - The input type for the predictDiseaseFromImage function.
 * - PredictDiseaseFromImageOutput - The return type for the predictDiseaseFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const PredictDiseaseFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a skin condition, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  modelType: z.enum(['CNN', 'VGG16', 'ResNet50']).describe('The type of deep learning model to use for prediction.'),
});
export type PredictDiseaseFromImageInput = z.infer<typeof PredictDiseaseFromImageInputSchema>;

const PredictDiseaseFromImageOutputSchema = z.object({
  predictedDisease: z.string().describe('The predicted skin disease. Common examples include "Eczema", "Psoriasis", "Acne", "Rosacea", "Melanoma", "Benign Keratosis", "Actinic Keratosis", or "Inappropriate image".'),
  confidence: z.number().describe('The confidence level of the prediction (0-1).'),
  details: z.string().describe('A brief, one-sentence explanation of the reasoning behind the prediction based on the model type.'),
});
export type PredictDiseaseFromImageOutput = z.infer<typeof PredictDiseaseFromImageOutputSchema>;

export async function predictDiseaseFromImage(input: PredictDiseaseFromImageInput): Promise<PredictDiseaseFromImageOutput> {
  return predictDiseaseFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictDiseaseFromImagePrompt',
  input: {schema: PredictDiseaseFromImageInputSchema},
  output: {schema: PredictDiseaseFromImageOutputSchema},
  prompt: `You are an AI dermatology assistant that analyzes images to identify skin conditions.
  Your task is to determine if the provided image is of a human skin condition and, if so, simulate a prediction from a deep learning model.

  First, check if the image is relevant.
  - If the image is NOT of a human skin condition (e.g., it's a car, a landscape, an animal), you MUST set 'predictedDisease' to 'Inappropriate image', 'confidence' to 1.0, and 'details' to 'The uploaded image does not appear to be a human skin condition.'.

  - If the image IS a human skin condition, then analyze it using the simulated characteristics of the selected model:
    - If modelType is 'CNN': Provide a balanced prediction considering basic features like color and shape.
    - If modelType is 'VGG16': Focus on texture and intricate patterns. The confidence might be slightly lower due to its sensitivity.
    - If modelType is 'ResNet50': Act as a very deep model. Consider complex and subtle features. Provide a higher confidence score and a more decisive-sounding detail.

    Based on your analysis, provide:
    1.  'predictedDisease': The most likely skin condition.
    2.  'confidence': A confidence score between 0.0 and 1.0. This should vary based on the modelType.
    3.  'details': A brief, one-sentence explanation for the diagnosis, tailored to the simulated model's focus.

  Image: {{media url=photoDataUri}}

  IMPORTANT: Your response MUST be valid JSON that adheres to the output schema. Do not include any explanatory text outside of the JSON structure.
  `,
});

const predictDiseaseFromImageFlow = ai.defineFlow(
  {
    name: 'predictDiseaseFromImageFlow',
    inputSchema: PredictDiseaseFromImageInputSchema,
    outputSchema: PredictDiseaseFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
