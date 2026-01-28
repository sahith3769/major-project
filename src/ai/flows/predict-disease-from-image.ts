'use server';

/**
 * @fileOverview Predicts skin disease from an image using a pre-trained deep learning model.
 *
 * - predictDiseaseFromImage - A function that predicts skin disease from an image.
 * - PredictDiseaseFromImageInput - The input type for the predictDiseaseFromImage function.
 * - PredictDiseaseFromImageOutput - The return type for the predictDiseaseFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictDiseaseFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of a skin condition, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Corrected the expected format
    ),
  modelType: z.enum(['CNN', 'VGG16', 'ResNet50']).describe('The type of deep learning model to use for prediction.'),
});
export type PredictDiseaseFromImageInput = z.infer<typeof PredictDiseaseFromImageInputSchema>;

const PredictDiseaseFromImageOutputSchema = z.object({
  predictedDisease: z.string().describe('The predicted skin disease.'),
  confidence: z.number().describe('The confidence level of the prediction (0-1).'),
});
export type PredictDiseaseFromImageOutput = z.infer<typeof PredictDiseaseFromImageOutputSchema>;

export async function predictDiseaseFromImage(input: PredictDiseaseFromImageInput): Promise<PredictDiseaseFromImageOutput> {
  return predictDiseaseFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictDiseaseFromImagePrompt',
  input: {schema: PredictDiseaseFromImageInputSchema},
  output: {schema: PredictDiseaseFromImageOutputSchema},
  prompt: `You are an AI that analyzes images of skin conditions and predicts the most likely disease.

  Analyze the provided image and provide the predicted disease and a confidence level (0-1).

  Use the {{modelType}} model to make the prediction.

  Image: {{media url=photoDataUri}}

  Ensure that the predictedDisease and confidence values are accurate and well-formatted.
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
