'use server';

import { z } from 'zod';
import { preprocessImage } from '@/ai/flows/image-preprocessing';
import { predictDiseaseFromImage, type PredictDiseaseFromImageOutput } from '@/ai/flows/predict-disease-from-image';

export type PredictionState = {
  prediction: PredictDiseaseFromImageOutput | null;
  error: string | null;
  timestamp: number;
};

const schema = z.object({
  photoDataUri: z.string().min(1, { message: 'Image is required.' }),
  modelType: z.enum(['CNN', 'VGG16', 'ResNet50']),
});

export async function getPrediction(prevState: PredictionState, formData: FormData): Promise<PredictionState> {
  const validatedFields = schema.safeParse({
    photoDataUri: formData.get('photoDataUri'),
    modelType: formData.get('modelType'),
  });

  if (!validatedFields.success) {
    return {
      prediction: null,
      error: validatedFields.error.flatten().fieldErrors.photoDataUri?.[0] || 'Invalid form data.',
      timestamp: Date.now(),
    };
  }
  
  const { photoDataUri, modelType } = validatedFields.data;

  try {
    const { preprocessedDataUri } = await preprocessImage({ photoDataUri });
    
    const predictionResult = await predictDiseaseFromImage({
      photoDataUri: preprocessedDataUri,
      modelType,
    });

    return {
      prediction: predictionResult,
      error: null,
      timestamp: Date.now(),
    };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
    return {
      prediction: null,
      error: `Prediction failed: ${errorMessage}`,
      timestamp: Date.now(),
    };
  }
}
