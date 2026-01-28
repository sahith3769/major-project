import { config } from 'dotenv';
config();

import '@/ai/flows/image-preprocessing.ts';
import '@/ai/flows/predict-disease-from-image.ts';