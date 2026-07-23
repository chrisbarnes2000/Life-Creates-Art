'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { DomeConfiguration } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Globe, Layers, Mail, Phone, User, Info, Loader2 } from 'lucide-react';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc, collection, serverTimestamp } from 'firebase/firestore';
import {
  addDocumentNonBlocking,
  setDocumentNonBlocking,
  initiateAnonymousSignIn,
} from '@/firebase';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from '@/components/ui/skeleton';

const consultationFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export function GeometricDomes() {
  const { toast } = useToast();
  const { firestore, auth, user, isUserLoading } = useFirebase();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const domePlaceholder = PlaceHolderImages.find((p) => p.id === 'geometric-dome');
  const domeDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'appConfig', 'dome-display');
  }, [firestore]);
  const { data: domeConfig, isLoading: isDomeLoading } = useDoc(domeDocRef);
  
  // Determine final image URL only after loading to prevent flickering between local fallback and custom remote
  const domeImageUrl = !isDomeLoading ? (domeConfig?.imageUrl || domePlaceholder?.imageUrl || '') : '';

  const [pricing, setPricing] = React.useState({
    base: 50,
    freq: { '2v': 1.0, '3v': 1.2, '4v': 1.5 },
    cover: { vinyl: 1.0, polycarbonate: 1.8 }
  });

  React.useEffect(() => {
    if (!user && !isUserLoading) {
      initiateAnonymousSignIn(auth);
    }
    const stored = localStorage.getItem('minibarn_master_config');
    if (stored) {
      const parsed = JSON.parse(stored);
      setPricing({
        base: parsed.pricing.domeBase,
        freq: { '2v': parsed.pricing.freq2v, '3v': parsed.pricing.freq3v, '4v': parsed.pricing.freq4v },
        cover: { vinyl: parsed.pricing.coverVinyl, polycarbonate: parsed.pricing.coverPoly }
      });
    }
  }, [user, auth, isUserLoading]);

  const [config, setConfig] = React.useState<DomeConfiguration>({
    diameter: 20,
    frequency: '2v',
    covering: 'polycarbonate',
    coveringColor: 'Snow White',
    notes: '',
  });
  const [quote, setQuote] = React.useState(0);
  const [showQuote, setShowQuote] = React.useState(false);
  const [anonymousRequestId, setAnonymousRequestId] = React.useState<string | null>(null);

  const VINYL_COLORS = [
    { name: 'Snow White', hex: '#FFFFFF' },
    { name: 'Sandstone', hex: '#D2B48C' },
    { name: 'Forest Green', hex: '#228B22' },
    { name: 'Royal Blue', hex: '#4169E1' },
    { name: 'Silver Slate', hex: '#808080' },
  ];

  React.useEffect(() => {
    const radius = config.diameter / 2;
    const surfaceArea = 2 * Math.PI * Math.pow(radius, 2); 
    const coveringModifier = pricing.cover[config.covering as keyof typeof pricing.cover] || 1.0;
    const frequencyModifier = pricing.freq[config.frequency] || 1.0;

    const newQuote = surfaceArea * pricing.base * coveringModifier * frequencyModifier;
    setQuote(newQuote);
  }, [config, pricing]);

  const form = useForm<z.infer<typeof consultationFormSchema>>({
    resolver: zodResolver(consultationFormSchema),
    defaultValues: { name: '', email: '', phone: '', notes: '' },
  });

  async function handleRequestInstantQuote() {
    if (showQuote) {
      setShowQuote(false);
      return;
    }

    if (!firestore || !user) return;

    setShowQuote(true);
    
    // Log anonymous inquiry
    try {
      const configSummary = `ANON DOME: ${config.diameter}ft, Frequency: ${config.frequency}, Covering: ${config.covering}${config.covering === 'vinyl' ? ` (${config.coveringColor})` : ''}. Estimate: $${quote.toFixed(2)}`;
      
      const consultationRequestsRef = collection(firestore, 'allConsultationRequests');
      const newRequestRef = doc(consultationRequestsRef);
      
      const anonData = {
        id: newRequestRef.id,
        customerId: user.uid,
        name: 'Anonymous (Quote Requested)',
        email: 'anonymous@requested.quote',
        configSummary,
        quoteEstimate: quote,
        requestDate: serverTimestamp(),
        status: 'Anonymous',
        isDome: true,
        diameter: config.diameter,
        frequency: config.frequency,
        covering: config.covering
      };

      setDocumentNonBlocking(newRequestRef, anonData, {});
      setAnonymousRequestId(newRequestRef.id);
    } catch (err) {
      console.error('Error logging anonymous inquiry:', err);
    }
  }

  async function onSubmit(values: z.infer<typeof consultationFormSchema>) {
    if (!firestore || !user) {
      toast({ variant: 'destructive', title: 'Error', description: 'Authentication required.' });
      return;
    }

    setIsSubmitting(true);
    const configSummary = `Dome: ${config.diameter}ft, Frequency: ${config.frequency}, Covering: ${config.covering}${config.covering === 'vinyl' ? ` (${config.coveringColor})` : ''}. Estimated: $${quote.toFixed(2)}${values.notes ? ` | Notes: ${values.notes}` : ''}`;

    try {
      const shedDesignsRef = collection(firestore, `customers/${user.uid}/shedDesigns`);
      const newShedDesign = {
        name: `${config.diameter}ft ${config.frequency} ${config.covering} Dome`,
        widthFeet: config.diameter,
        lengthFeet: config.diameter,
        roofStyle: 'Dome',
        frequency: config.frequency,
        covering: config.covering,
        coveringColor: config.covering === 'vinyl' ? config.coveringColor : null,
        notes: values.notes || null,
        createdDate: serverTimestamp(),
        lastModifiedDate: serverTimestamp(),
        isAiSuggested: false,
        customerId: user.uid,
        quoteEstimate: quote,
      };

      const designDocRef = await addDocumentNonBlocking(shedDesignsRef, newShedDesign);
      
      if (designDocRef) {
        const consultationRequestsRef = collection(firestore, 'allConsultationRequests');
        
        // If we have an anonymous request already, we can technically update it or just create a new one.
        // The user suggested "save it as an anon inquiry unless they then submit contact details for a manual proper quote"
        // This implies upgrading the anon info.
        
        const targetRequestRef = anonymousRequestId 
          ? doc(consultationRequestsRef, anonymousRequestId)
          : doc(consultationRequestsRef);
        
        const requestData = {
          id: targetRequestRef.id,
          customerId: user.uid,
          shedDesignId: designDocRef.id,
          ...values,
          configSummary,
          requestDate: serverTimestamp(),
          preferredContactMethod: 'Email',
          status: 'Submitted',
        };

        setDocumentNonBlocking(targetRequestRef, requestData, {});
        const userRequestRef = doc(firestore, `customers/${user.uid}/consultationRequests/${targetRequestRef.id}`);
        setDocumentNonBlocking(userRequestRef, requestData, {});

        toast({ title: 'Request Sent!', description: 'We will contact you shortly regarding your dome.' });
        form.reset();
        setAnonymousRequestId(null); // Reset after full submission
      }
    } catch (err) {
      console.error('Error submitting dome request:', err);
      // Handled globally
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!mounted) {
    return (
      <div className="flex h-96 items-center justify-center bg-muted/20 rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="relative aspect-[2/1] w-full overflow-hidden rounded-lg bg-primary/5">
        {isDomeLoading ? (
          <Skeleton className="h-full w-full opacity-50" />
        ) : (
          domeImageUrl && (
            <Image 
              src={domeImageUrl} 
              alt="Geodesic Dome Display" 
              width={800} 
              height={400} 
              className="h-full w-full object-cover transition-opacity duration-700 animate-in fade-in" 
              data-ai-hint="geodesic dome" 
            />
          )
        )}
      </div>
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-xl font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">1</span> Dome Size & Frequency
        </h3>
        <div className="grid grid-cols-1 gap-6 rounded-lg border p-6 md:grid-cols-2">
          <div>
            <Label htmlFor="diameter-slider">Diameter: {config.diameter} ft</Label>
            <div className="flex items-center gap-4 mt-2">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <Slider 
                id="diameter-slider"
                aria-label="Diameter"
                min={10} 
                max={40} 
                step={2} 
                value={[config.diameter]} 
                onValueChange={(v) => setConfig({ ...config, diameter: v[0] })} 
              />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label>Frequency</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild><Info className="h-5 w-5 text-muted-foreground cursor-help" /></TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    Frequency (V) determines the smoothness of the dome. 2V is angular, 3V is balanced, and 4V is the roundest/most spherical.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <TooltipProvider>
              <RadioGroup value={config.frequency} onValueChange={(v: '2v' | '3v' | '4v') => setConfig({ ...config, frequency: v })} className="flex gap-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="2v" id="2v" /><Label htmlFor="2v">2V</Label></div>
                  </TooltipTrigger>
                  <TooltipContent>Standard complexity (x1.0)</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="3v" id="3v" /><Label htmlFor="3v">3V</Label></div>
                  </TooltipTrigger>
                  <TooltipContent>Increased smoothing (x{pricing.freq['3v']})</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="4v" id="4v" /><Label htmlFor="4v">4V</Label></div>
                  </TooltipTrigger>
                  <TooltipContent>Maximum spherical precision (x{pricing.freq['4v']})</TooltipContent>
                </Tooltip>
              </RadioGroup>
            </TooltipProvider>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-xl font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">2</span> Covering Material
        </h3>
        <TooltipProvider>
          <RadioGroup value={config.covering} onValueChange={(v: 'vinyl' | 'polycarbonate') => setConfig({ ...config, covering: v })} className="grid grid-cols-1 gap-4 rounded-lg border p-6 md:grid-cols-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-2 cursor-help">
                  <RadioGroupItem value="vinyl" id="vinyl" />
                  <Label htmlFor="vinyl" className="flex items-center gap-2 font-bold"><Layers className="h-5 w-5 text-muted-foreground" /> Marine Vinyl (Solid)</Label>
                </div>
              </TooltipTrigger>
              <TooltipContent>Durable, weatherproof solid cover</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-2 cursor-help">
                  <RadioGroupItem value="polycarbonate" id="polycarbonate" />
                  <Label htmlFor="polycarbonate" className="flex items-center gap-2 font-bold"><Layers className="h-5 w-5 text-muted-foreground" /> Clear Polycarbonate</Label>
                </div>
              </TooltipTrigger>
              <TooltipContent>Premium x{pricing.cover.polycarbonate} modifier for transparency</TooltipContent>
            </Tooltip>
          </RadioGroup>
        </TooltipProvider>

        {config.covering === 'vinyl' && (
          <div className="animate-in fade-in slide-in-from-top-2 rounded-lg border-2 border-primary/20 p-6 bg-primary/5">
            <Label className="block mb-4 text-sm font-bold uppercase tracking-wider text-primary">Select Vinyl Cover Color</Label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
              {VINYL_COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setConfig({ ...config, coveringColor: color.name })}
                  className={`group flex flex-col items-center gap-2 transition-transform hover:scale-105 ${config.coveringColor === color.name ? 'scale-110' : ''}`}
                >
                  <div 
                    className={`h-12 w-12 rounded-full border-2 shadow-sm transition-all ${config.coveringColor === color.name ? 'border-primary ring-4 ring-primary/20' : 'border-slate-300'}`}
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className={`text-[10px] font-bold uppercase ${config.coveringColor === color.name ? 'text-primary' : 'text-muted-foreground'}`}>
                    {color.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg bg-accent/20 p-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4 px-2">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Instant Quote Engine</h3>
            <p className="text-[10px] text-muted-foreground/80 font-medium">Click below to generate a real-time estimate based on your configuration.</p>
          </div>
          <Button 
            variant={showQuote ? "ghost" : "default"}
            size="sm" 
            onClick={handleRequestInstantQuote}
            className={`h-10 font-black text-[11px] uppercase tracking-widest transition-all shadow-md px-6 ${showQuote ? 'border-primary/20 hover:bg-primary/10' : 'bg-primary text-primary-foreground hover:scale-105'}`}
          >
            {showQuote ? 'Hide Estimate' : 'Request Instant Quote'}
          </Button>
        </div>
        
        {showQuote ? (
          <div className="text-center animate-in fade-in zoom-in duration-500 py-4 bg-background/40 rounded-2xl border border-primary/10">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Authenticated Estimate</h3>
            <p className="font-headline text-5xl md:text-6xl font-black text-primary tracking-tighter">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(quote)}
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Base fabrication only • Excludes shipping</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-primary/20 rounded-2xl animate-in fade-in slide-in-from-bottom-4 bg-primary/5">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
              <Layers className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-primary tracking-tight">Pricing is currently hidden.</p>
            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mt-2 max-w-[250px] mx-auto leading-relaxed">
              Use the request button above to see your configuration's value instantly.
            </p>
          </div>
        )}
      </div>

      <Separator />

      <div>
        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">3</span> Contact Details
        </h3>
        <div className="mb-6 p-4 rounded-lg border bg-background text-center">
          <p className="text-sm text-foreground">
            Prefer to speak with us directly? Call <a href="tel:+13605932799" className="font-bold text-accent underline">+1 (360) 593-2799</a>.
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 rounded-lg border p-6 bg-muted/30">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="John Doe" {...field} className="pl-10" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="you@example.com" {...field} className="pl-10" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="(555) 123-4567" {...field} className="pl-10" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem>
                <FormLabel>Special Instructions & Placement</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe your site placement, any desired window locations, or specific amenities for your dome..." 
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" className="w-full h-12 text-lg bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Submit for Detailed Quote'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
