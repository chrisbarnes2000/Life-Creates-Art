'use server';
/**
 * @fileOverview An AI design assistant that provides personalized shed configuration
 * and material recommendations based on property location and specific weather conditions
 * in the Pacific Northwest.
 *
 * - weatherResilientShedDesignAssistant - A function that handles the shed design assistance process.
 * - WeatherResilientShedDesignAssistantInput - The input type for the assistant function.
 * - WeatherResilientShedDesignAssistantOutput - The return type for the assistant function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const WeatherResilientShedDesignAssistantInputSchema = z.object({
  location: z.string().describe('The property\u0027s location within the Pacific Northwest.'),
  highRainfall: z.boolean().describe('Whether the property experiences high rainfall.'),
  windExposure: z.boolean().describe('Whether the property has significant wind exposure.'),
  shade: z.boolean().describe('Whether the property is in a shaded area.'),
});
export type WeatherResilientShedDesignAssistantInput = z.infer<typeof WeatherResilientShedDesignAssistantInputSchema>;

const WeatherResilientShedDesignAssistantOutputSchema = z.object({
  configurationRecommendations: z.string().describe('Optimal shed configuration recommendations.'),
  materialRecommendations: z.string().describe('Material choices optimized for the local climate.'),
});
export type WeatherResilientShedDesignAssistantOutput = z.infer<typeof WeatherResilientShedDesignAssistantOutputSchema>;

export async function weatherResilientShedDesignAssistant(input: WeatherResilientShedDesignAssistantInput): Promise<WeatherResilientShedDesignAssistantOutput> {
  return weatherResilientShedDesignAssistantFlow(input);
}

const assistantPrompt = ai.definePrompt({
  name: 'weatherResilientShedDesignAssistantPrompt',
  input: { schema: WeatherResilientShedDesignAssistantInputSchema },
  output: { schema: WeatherResilientShedDesignAssistantOutputSchema },
  prompt: `You are an AI design assistant for MiniBarnMaster, a company specializing in storage sheds for the Pacific Northwest. You need to provide personalized recommendations for shed configurations and material choices, optimizing for resilience to the local climate.

MiniBarnMaster uses only high-quality products like CDX plywood and T1-11 siding, and all buildings come with a 5-year guarantee for materials and craftsmanship.

Based on the following property details, provide optimal shed configuration and material recommendations to withstand the Pacific Northwest weather:

Property Location: {{{location}}}
High Rainfall: {{{highRainfall}}}
Wind Exposure: {{{windExposure}}}
Shade: {{{shade}}}

Consider how these conditions might impact the shed's longevity and structural integrity. Focus on practical advice for shed design and material selection that aligns with MiniBarnMaster's offerings (CDX plywood, T1-11 siding).`,
});

const weatherResilientShedDesignAssistantFlow = ai.defineFlow(
  {
    name: 'weatherResilientShedDesignAssistantFlow',
    inputSchema: WeatherResilientShedDesignAssistantInputSchema,
    outputSchema: WeatherResilientShedDesignAssistantOutputSchema,
  },
  async (input) => {
    const { output } = await assistantPrompt(input);
    return output!;
  }
);
