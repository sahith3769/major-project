'use server';
/**
 * @fileOverview Image preprocessing flow to resize, normalize, and remove noise from images for increased AI tool accuracy.
 *
 * - preprocessImage - A function that handles the image preprocessing.
 * - PreprocessImageInput - The input type for the preprocessImage function.
 * - PreprocessImageOutput - The return type for the preprocessImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import sharp from 'sharp';

const PreprocessImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of skin, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
});
export type PreprocessImageInput = z.infer<typeof PreprocessImageInputSchema>;

const PreprocessImageOutputSchema = z.object({
  preprocessedDataUri: z.string().describe('The preprocessed image as a data URI.'),
});
export type PreprocessImageOutput = z.infer<typeof PreprocessImageOutputSchema>;

export async function preprocessImage(input: PreprocessImageInput): Promise<PreprocessImageOutput> {
  return preprocessImageFlow(input);
}

const preprocessImageFlow = ai.defineFlow(
  {
    name: 'preprocessImageFlow',
    inputSchema: PreprocessImageInputSchema,
    outputSchema: PreprocessImageOutputSchema,
  },
  async input => {
    const {photoDataUri} = input;

    // Extract the image data from the data URI
    const base64Image = photoDataUri.split(';base64,').pop()!;
    const buffer = Buffer.from(base64Image, 'base64');

    // Use sharp to resize, normalize, and remove noise
    const preprocessedBuffer = await sharp(buffer)
      .resize(224, 224, { // Resize to a fixed size
        fit: sharp.fit.cover,
        withoutEnlargement: true,
      })
      .normalise() // Normalize the image
      .blur(0.5) // Remove noise (adjust the blur value as needed)
      .toBuffer();

    // Convert the preprocessed image back to a data URI
    const mimeType = photoDataUri.substring(5, photoDataUri.indexOf(';')); // Extract the original mime type
    const preprocessedDataUri = `data:${mimeType};base64,${preprocessedBuffer.toString('base64')}`;

    return {
      preprocessedDataUri: preprocessedDataUri,
    };
  }
);
