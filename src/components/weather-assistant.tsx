'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getShedRecommendations } from '@/app/actions';
import type { WeatherResilientShedDesignAssistantOutput } from '@/ai/flows/weather-resilient-shed-design-assistant';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Loader2,
  Wand2,
  Wind,
  CloudRain,
  Sun,
  Building,
  Shield,
  MapPin,
} from 'lucide-react';

const formSchema = z.object({
  location: z.string({
    required_error: 'Please select a location.',
  }),
  highRainfall: z.boolean().default(false),
  windExposure: z.boolean().default(false),
  shade: z.boolean().default(false),
});

const pnwLocations = [
  { value: 'seattle-wa', label: 'Seattle, WA (Urban, High Rainfall)' },
  { value: 'portland-or', label: 'Portland, OR (Urban, Moderate Rainfall)' },
  { value: 'boise-id', label: 'Boise, ID (Dry, Sunny)' },
  { value: 'bend-or', label: 'Bend, OR (High Desert, Windy)' },
  {
    value: 'coast-wa',
    label: 'Washington Coast (Coastal, Very High Rain/Wind)',
  },
  {
    value: 'cascades-wa',
    label: 'Cascade Mountains, WA (Mountainous, Heavy Snow)',
  },
];

export function WeatherAssistant() {
  const [recommendations, setRecommendations] =
    React.useState<WeatherResilientShedDesignAssistantOutput | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: 'seattle-wa',
      highRainfall: true,
      windExposure: false,
      shade: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setRecommendations(null);

    const selectedLocation = pnwLocations.find(
      (l) => l.value === values.location
    );

    try {
      const result = await getShedRecommendations({
        ...values,
        location: selectedLocation ? selectedLocation.label : values.location,
      });
      setRecommendations(result);
    } catch (e) {
      setError(
        "Sorry, we couldn't get recommendations at this time. Please try again later."
      );
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle asChild>
              <h2 className="text-primary h3">
                Expert Climate Guide
              </h2>
            </CardTitle>
            <CardDescription>
              Local building knowledge for Pierce County & WA.
            </CardDescription>
          </div>
          <Wand2 className="h-8 w-8 text-accent" />
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Property Location
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a location type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {pnwLocations.map((loc) => (
                        <SelectItem key={loc.value} value={loc.value}>
                          {loc.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="highRainfall"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="flex items-center gap-2">
                        <CloudRain className="h-4 w-4" /> High Rainfall
                      </FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-label="Toggle high rainfall resilience"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="windExposure"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="flex items-center gap-2">
                        <Wind className="h-4 w-4" /> Significant Wind
                      </FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-label="Toggle significant wind resilience"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shade"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="flex items-center gap-2">
                        <Sun className="h-4 w-4" /> Mostly Shaded
                      </FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-label="Toggle shaded area optimization"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                'Get Recommendations'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>

      {isLoading && (
        <CardFooter className="flex justify-center">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Preparing local specifications...
          </p>
        </CardFooter>
      )}

      {error && (
        <CardFooter>
          <p className="text-sm text-destructive">{error}</p>
        </CardFooter>
      )}

      {recommendations && (
        <CardFooter className="flex flex-col items-start gap-4 border-t bg-primary/5 pt-6">
          <h4 className="text-lg font-semibold text-primary">
            Expert Building Specifications
          </h4>
          <div className="w-full space-y-4">
            <div>
              <h5 className="flex items-center gap-2 font-semibold">
                <Building className="h-5 w-5 text-primary" /> Structural Advice
              </h5>
              <p className="pl-7 text-sm text-foreground/80">
                {recommendations.configurationRecommendations}
              </p>
            </div>
            <div>
              <h5 className="flex items-center gap-2 font-semibold">
                <Shield className="h-5 w-5 text-primary" /> Recommended Materials
              </h5>
              <p className="pl-7 text-sm text-foreground/80">
                {recommendations.materialRecommendations}
              </p>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
