'use client';

import { useState, useTransition, type ChangeEvent, useEffect, useActionState } from 'react';
import Image from 'next/image';
import { UploadCloud, Microscope, BrainCircuit, AlertTriangle, Info } from 'lucide-react';

import { getPrediction, type PredictionState } from '@/app/actions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Header } from '@/components/header';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';

const initialState: PredictionState = {
  prediction: null,
  error: null,
  timestamp: Date.now(),
};

function SubmitButton({ disabled, isPending }: { disabled: boolean; isPending: boolean }) {
  return (
    <Button type="submit" disabled={disabled || isPending} className="w-full font-semibold text-lg py-6 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
      {isPending ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Analyzing...
        </>
      ) : (
        <>
          <Microscope className="mr-2 h-5 w-5" />
          Predict Disease
        </>
      )}
    </Button>
  );
}

export default function Home() {
  const [state, formAction] = useActionState(getPrediction, initialState);
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [photoDataUri, setPhotoDataUri] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    if (state.error) {
      toast({
        variant: "destructive",
        title: "Prediction Error",
        description: state.error,
      });
    }
  }, [state.error, state.timestamp, toast]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setPhotoDataUri(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormAction = (formData: FormData) => {
    if (!photoDataUri) {
        toast({
            variant: "destructive",
            title: "Image Missing",
            description: "Please upload an image before predicting.",
        });
        return;
    }
    startTransition(() => {
      formAction(formData);
    });
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Identify Skin Conditions with AI</h2>
          <p className="text-lg text-muted-foreground mt-2 max-w-3xl mx-auto">
            Upload an image of a skin condition, and our advanced AI models will provide a potential identification. Fast, simple, and confidential.
          </p>
        </div>

        <form action={handleFormAction}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <Card className="w-full shadow-lg border-border/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl"><UploadCloud className="text-primary"/> 1. Upload Your Image</CardTitle>
                <CardDescription>Select a clear photo of the skin area for analysis.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center items-center border-2 border-dashed border-border rounded-lg p-6 min-h-[250px] bg-accent/30 transition-colors hover:border-primary">
                  <Label htmlFor="image-upload" className="cursor-pointer w-full text-center">
                    {imagePreview ? (
                      <div className="relative w-full max-w-xs mx-auto aspect-square">
                        <Image src={imagePreview} alt="Uploaded skin condition" fill style={{objectFit: 'cover'}} className="rounded-md shadow-md" />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <UploadCloud className="w-12 h-12" />
                        <span className="font-semibold">Click to upload or drag and drop</span>
                        <span className="text-sm">PNG, JPG, or WEBP</span>
                      </div>
                    )}
                  </Label>
                  <input id="image-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} name="imageFile" />
                  <input type="hidden" name="photoDataUri" value={photoDataUri} />
                </div>
                
                <div>
                  <Label className="text-lg font-semibold flex items-center gap-2"><BrainCircuit className="text-primary"/> 2. Choose a Model</Label>
                  <p className="text-sm text-muted-foreground mb-4">Select the AI model for prediction. ResNet50 is recommended for general use.</p>
                  <RadioGroup defaultValue="ResNet50" className="grid grid-cols-1 sm:grid-cols-3 gap-4" name="modelType">
                    {['CNN', 'VGG16', 'ResNet50'].map(model => (
                      <div key={model}>
                        <RadioGroupItem value={model} id={model} className="sr-only" />
                        <Label htmlFor={model} className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 font-semibold hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-accent/50 cursor-pointer transition-all duration-200">
                          {model}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </CardContent>
              <CardFooter>
                 <SubmitButton disabled={!imagePreview} isPending={isPending} />
              </CardFooter>
            </Card>

            <div className="space-y-8">
              <Card className="w-full shadow-lg border-border/80 sticky top-24">
                <CardHeader>
                  <CardTitle className="text-2xl">3. AI Prediction</CardTitle>
                  <CardDescription>Results will be displayed here after analysis.</CardDescription>
                </CardHeader>
                <CardContent className="min-h-[300px] flex items-center justify-center p-6">
                  {isPending && (
                    <div className="flex flex-col items-center gap-4 text-muted-foreground animate-pulse">
                      <Skeleton className="h-24 w-24 rounded-full bg-accent/50" />
                      <Skeleton className="h-6 w-48 bg-accent/50" />
                      <Skeleton className="h-4 w-32 bg-accent/50" />
                    </div>
                  )}
                  {!isPending && state.prediction && (
                    <div className="w-full space-y-4 text-center">
                      <p className="text-muted-foreground font-medium">Predicted Condition:</p>
                      <h3 className="text-4xl font-bold text-primary animate-fade-in">{state.prediction.predictedDisease}</h3>
                      <div className="space-y-2 pt-4">
                        <div className="flex justify-between items-center text-sm font-medium">
                          <span className="text-muted-foreground">Confidence Score</span>
                          <span className="text-primary font-bold">{(state.prediction.confidence * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={state.prediction.confidence * 100} className="w-full h-3" />
                      </div>
                      {state.prediction.details && (
                        <Alert className="text-left mt-4" variant="default">
                          <Info className="h-4 w-4" />
                          <AlertTitle>Model Reasoning</AlertTitle>
                          <AlertDescription>
                            {state.prediction.details}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                  {!isPending && !state.prediction && (
                     <div className="flex flex-col items-center text-center text-muted-foreground p-8">
                        <Info className="w-12 h-12 mb-4" />
                        <p className="font-semibold">Your analysis results will appear here.</p>
                        <p className="text-sm">Please upload an image and select a model to begin.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Alert variant="destructive" className="shadow-md bg-destructive/10 border-destructive/30">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <AlertTitle className="font-bold text-destructive">Disclaimer</AlertTitle>
                <AlertDescription className="text-destructive/90">
                  This is an AI-generated prediction and not a substitute for professional medical advice. Please consult a qualified doctor for an accurate diagnosis and treatment plan.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </form>
      </main>
      <footer className="text-center py-4 mt-8 border-t border-border/50">
        <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} SkinVision AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
