'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { ShedConfiguration, RoofStyle } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Ruler, DoorOpen, Mail, Phone, User, Grid, Wind, Droplets, Paintbrush, Loader2, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc, collection, serverTimestamp } from 'firebase/firestore';
import {
  addDocumentNonBlocking,
  setDocumentNonBlocking,
  initiateAnonymousSignIn,
} from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const roofStylesData: Omit<RoofStyle, 'image' | 'imageHint'>[] = [
  {
    id: 'gable',
    name: 'Gable Roof',
    description: 'Classic, versatile design that easily sheds water.',
    priceModifier: 1.0,
  },
  {
    id: 'gambrel',
    name: 'Gambrel Roof',
    description: 'Barn-style look that maximizes overhead storage space.',
    priceModifier: 1.2,
  },
];

const consultationFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export function ShedCustomizer() {
  const { toast } = useToast();
  const { firestore, auth, user, isUserLoading } = useFirebase();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  const [limits, setLimits] = React.useState({ minWidth: 8, minLength: 8, maxWidth: 12, maxLength: 20 });
  const [pricing, setPricing] = React.useState({
    base: 25,
    doors: { single: 200, double: 350 },
    roofs: { gable: 1.0, gambrel: 1.2 },
    windowPrice: 150,
    ventPrice: 75,
    gutterPrice: 250,
    paintPrice: 500,
    rampPrice: 250,
    skirtPrice: 400
  });

  const gableDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'appConfig', 'roof-gable');
  }, [firestore]);
  const gambrelDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'appConfig', 'roof-gambrel');
  }, [firestore]);

  const { data: gableConfig, isLoading: isGableLoading } = useDoc(gableDocRef);
  const { data: gambrelConfig, isLoading: isGambrelLoading } = useDoc(gambrelDocRef);

  React.useEffect(() => {
    if (!user && !isUserLoading) {
      initiateAnonymousSignIn(auth);
    }
    
    const stored = localStorage.getItem('minibarn_master_config');
    if (stored) {
      const parsed = JSON.parse(stored);
      setLimits(parsed.limits);
      setPricing({
        base: parsed.pricing.shedBase,
        doors: { single: parsed.pricing.doorSingle, double: parsed.pricing.doorDouble },
        roofs: { gable: parsed.pricing.roofGable, gambrel: parsed.pricing.roofGambrel },
        windowPrice: parsed.pricing.windowPrice,
        ventPrice: parsed.pricing.ventPrice,
        gutterPrice: parsed.pricing.gutterPrice,
        paintPrice: parsed.pricing.paintPrice,
        rampPrice: parsed.pricing.rampPrice || 250,
        skirtPrice: parsed.pricing.skirtPrice || 400
      });
    }
  }, [user, auth, isUserLoading]);

  const [config, setConfig] = React.useState<ShedConfiguration>({
    width: 10,
    length: 12,
    roofStyle: 'gable',
    doors: 'single',
    windows: 0,
    hasVents: false,
    hasGutters: false,
    hasPaint: false,
    paintColor: 'Barn Red',
    hasRamp: false,
    hasSkirt: false,
    notes: '',
  });
  const [quote, setQuote] = React.useState(0);
  const [showQuote, setShowQuote] = React.useState(false);
  const [anonymousRequestId, setAnonymousRequestId] = React.useState<string | null>(null);

  const PAINT_COLORS = [
    { name: 'Barn Red', hex: '#8B0000' },
    { name: 'Hunter Green', hex: '#355E3B' },
    { name: 'Navajo White', hex: '#FFDEAD' },
    { name: 'Chestnut Brown', hex: '#8B4513' },
    { name: 'Slate Gray', hex: '#708090' },
    { name: 'Blue Ridge', hex: '#1e3a8a' },
  ];

  const roofStyles: RoofStyle[] = React.useMemo(() => {
    return roofStylesData.map((style) => {
      const pImage = PlaceHolderImages.find((p) => p.id === `roof-${style.id}`);
      const isLoading = style.id === 'gable' ? isGableLoading : isGambrelLoading;
      const dynamicUrl = style.id === 'gable' ? gableConfig?.imageUrl : gambrelConfig?.imageUrl;
      
      // If we are still loading, we don't return an image yet to prevent the fallback-to-custom flicker
      return {
        ...style,
        image: !isLoading ? (dynamicUrl || pImage?.imageUrl || '') : '',
        imageHint: pImage?.imageHint || '',
        priceModifier: pricing.roofs[style.id as keyof typeof pricing.roofs] || style.priceModifier
      };
    });
  }, [pricing, gableConfig, gambrelConfig, isGableLoading, isGambrelLoading]);

  React.useEffect(() => {
    const area = config.width * config.length;
    const roof = roofStyles.find((r) => r.id === config.roofStyle);
    const roofPriceModifier = roof ? roof.priceModifier : 1.0;
    const doorPrice = pricing.doors[config.doors as keyof typeof pricing.doors] || 0;
    
    const accessoriesPrice = 
      (config.windows * pricing.windowPrice) + 
      (config.hasVents ? pricing.ventPrice : 0) + 
      (config.hasGutters ? pricing.gutterPrice : 0) + 
      (config.hasPaint ? pricing.paintPrice : 0) +
      (config.hasRamp ? pricing.rampPrice : 0) +
      (config.hasSkirt ? pricing.skirtPrice : 0);

    const newQuote = area * pricing.base * roofPriceModifier + doorPrice + accessoriesPrice;
    setQuote(newQuote);
  }, [config, roofStyles, pricing]);

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
      const configSummary = `ANON SHED: ${config.width}x${config.length}ft, ${config.roofStyle} roof, ${config.doors} door, ${config.windows} windows, Vents: ${config.hasVents}, Gutters: ${config.hasGutters}, Paint: ${config.hasPaint}${config.hasPaint ? ` (${config.paintColor})` : ''}, Ramp: ${config.hasRamp}, Skirting: ${config.hasSkirt}. Estimate: $${quote.toFixed(2)}`;
      
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
        isShed: true,
        width: config.width,
        length: config.length,
        roofStyle: config.roofStyle
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
    const configSummary = `Shed: ${config.width}x${config.length}ft, ${config.roofStyle} roof, ${config.doors} door, ${config.windows} windows, Vents: ${config.hasVents}, Gutters: ${config.hasGutters}, Paint: ${config.hasPaint}${config.hasPaint ? ` (${config.paintColor})` : ''}, Ramp: ${config.hasRamp}, Skirting: ${config.hasSkirt}. Estimated: $${quote.toFixed(2)}${values.notes ? ` | Notes: ${values.notes}` : ''}`;

    try {
      const shedDesignsRef = collection(firestore, `customers/${user.uid}/shedDesigns`);
      const newShedDesign = {
        name: `${config.width}x${config.length} ${config.roofStyle} Shed`,
        widthFeet: config.width,
        lengthFeet: config.length,
        roofStyle: config.roofStyle,
        doorType: config.doors,
        windows: config.windows,
        hasVents: config.hasVents,
        hasGutters: config.hasGutters,
        hasPaint: config.hasPaint,
        paintColor: config.hasPaint ? config.paintColor : null,
        hasRamp: config.hasRamp,
        hasSkirt: config.hasSkirt,
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

        toast({ title: 'Design Submitted!', description: 'We will review your shed configuration and contact you.' });
        form.reset();
        setAnonymousRequestId(null);
      }
    } catch (err) {
      console.error('Error submitting shed design:', err);
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
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-xl font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">1</span> Dimensions
        </h3>
        <div className="grid grid-cols-1 gap-6 rounded-lg border p-4 md:grid-cols-2">
          <div>
            <Label htmlFor="width-slider">Width: {config.width} ft</Label>
            <div className="flex items-center gap-4 mt-2">
              <Ruler className="h-5 w-5 text-muted-foreground" />
              <Slider 
                id="width-slider"
                aria-label="Shed Width"
                min={limits.minWidth || 8} 
                max={limits.maxWidth} 
                step={2} 
                value={[config.width]} 
                onValueChange={(v) => setConfig({ ...config, width: v[0] })} 
              />
            </div>
          </div>
          <div>
            <Label htmlFor="length-slider">Length: {config.length} ft</Label>
            <div className="flex items-center gap-4 mt-2">
              <Ruler className="h-5 w-5 text-muted-foreground" />
              <Slider 
                id="length-slider"
                aria-label="Shed Length"
                min={limits.minLength || 8} 
                max={limits.maxLength} 
                step={2} 
                value={[config.length]} 
                onValueChange={(v) => setConfig({ ...config, length: v[0] })} 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-xl font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">2</span> Roof Style
        </h3>
        <div className="space-y-4">
          <RadioGroup value={config.roofStyle} onValueChange={(v: 'gable' | 'gambrel') => setConfig({ ...config, roofStyle: v })} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {roofStyles.map((style) => (
              <Label key={style.id} className="relative block cursor-pointer">
                <RadioGroupItem value={style.id} className="sr-only" />
                <Card className={config.roofStyle === style.id ? 'border-primary ring-2 ring-primary' : ''}>
                  <CardContent className="p-0 overflow-hidden">
                    <div className="relative aspect-[21/9] w-full bg-primary/5">
                      {!style.image ? (
                        <Skeleton className="h-full w-full opacity-50" />
                      ) : (
                        <Image 
                          src={style.image} 
                          alt={`${style.name} roof style for custom shed`} 
                          fill
                          className="object-cover transition-opacity duration-700 animate-in fade-in" 
                          sizes="(max-width: 768px) 100vw, 800px"
                          quality={75}
                        />
                      )}
                    </div>
                    <div className="p-3 text-center">
                      <h4 className="font-semibold text-sm">{style.name}</h4>
                      <p className="text-[10px] text-muted-foreground">{style.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </Label>
            ))}
          </RadioGroup>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-xl font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">3</span> Doors & Windows
        </h3>
        <div className="grid grid-cols-1 gap-6 rounded-lg border p-6 md:grid-cols-2">
          <div className="space-y-4">
            <Label className="flex items-center gap-2"><DoorOpen className="h-5 w-5 text-muted-foreground" /> Door Configuration</Label>
            <TooltipProvider>
              <RadioGroup value={config.doors} onValueChange={(v: 'single' | 'double') => setConfig({ ...config, doors: v })} className="mt-2 space-y-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="single" id="single-door" />
                      <Label htmlFor="single-door" className="flex items-center gap-2">Single Standard Door</Label>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Adds ${pricing.doors.single} to base price</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="double" id="double-door" />
                      <Label htmlFor="double-door" className="flex items-center gap-2">Double Wide Doors</Label>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Adds ${pricing.doors.double} to base price</TooltipContent>
                </Tooltip>
              </RadioGroup>
            </TooltipProvider>
          </div>
          <div className="space-y-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label htmlFor="window-slider" className="flex items-center gap-2 cursor-help"><Grid className="h-5 w-5 text-muted-foreground" /> Windows: {config.windows}</Label>
                </TooltipTrigger>
                <TooltipContent>${pricing.windowPrice} each</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="pt-2">
              <Slider 
                id="window-slider"
                aria-label="Number of windows"
                min={0} 
                max={4} 
                step={1} 
                value={[config.windows]} 
                onValueChange={(v) => setConfig({...config, windows: v[0]})} 
              />
              <div className="flex justify-between mt-2 text-[10px] text-muted-foreground uppercase font-bold">
                <span>None</span>
                <span>4 Max</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-xl font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">4</span> Options & Accessories
        </h3>
        <TooltipProvider>
          <div className="grid grid-cols-1 gap-4 rounded-lg border p-6 sm:grid-cols-2 lg:grid-cols-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors cursor-help">
                  <Label className="flex items-center gap-2 cursor-pointer"><Wind className="h-5 w-5 text-muted-foreground" /> Ridge Vents</Label>
                  <Switch checked={config.hasVents} onCheckedChange={(v) => setConfig({...config, hasVents: v})} />
                </div>
              </TooltipTrigger>
              <TooltipContent>${pricing.ventPrice} flat fee</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors cursor-help">
                  <Label className="flex items-center gap-2 cursor-pointer"><Droplets className="h-5 w-5 text-muted-foreground" /> Gutters</Label>
                  <Switch checked={config.hasGutters} onCheckedChange={(v) => setConfig({...config, hasGutters: v})} />
                </div>
              </TooltipTrigger>
              <TooltipContent>${pricing.gutterPrice} flat fee</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors cursor-help">
                  <Label className="flex items-center gap-2 cursor-pointer"><Paintbrush className="h-5 w-5 text-muted-foreground" /> Professional Paint</Label>
                  <Switch checked={config.hasPaint} onCheckedChange={(v) => setConfig({...config, hasPaint: v})} />
                </div>
              </TooltipTrigger>
              <TooltipContent>${pricing.paintPrice} flat fee</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors cursor-help">
                  <Label className="flex items-center gap-2 cursor-pointer text-emerald-700 font-bold"><ArrowUpRight className="h-5 w-5" /> Pressure Treated Ramp</Label>
                  <Switch checked={config.hasRamp} onCheckedChange={(v) => setConfig({...config, hasRamp: v})} />
                </div>
              </TooltipTrigger>
              <TooltipContent>${pricing.rampPrice} flat fee</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors cursor-help">
                  <Label className="flex items-center gap-2 cursor-pointer text-emerald-700 font-bold"><ShieldCheck className="h-5 w-5" /> Perimeter Skirting</Label>
                  <Switch checked={config.hasSkirt} onCheckedChange={(v) => setConfig({...config, hasSkirt: v})} />
                </div>
              </TooltipTrigger>
              <TooltipContent>${pricing.skirtPrice} flat fee</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        <div className="p-4 bg-muted/20 border border-dashed rounded-lg text-center">
          <p className="text-xs text-muted-foreground font-medium">Looking for custom shelving, electrical, or distinct amenities? Mention it in your consultation request details below!</p>
        </div>

        {config.hasPaint && (
          <div className="animate-in fade-in slide-in-from-top-2 rounded-lg border-2 border-primary/20 p-6 bg-primary/5">
            <Label className="block mb-4 text-sm font-bold uppercase tracking-wider text-primary">Select Custom Paint Color</Label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              {PAINT_COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setConfig({ ...config, paintColor: color.name })}
                  className={`group flex flex-col items-center gap-2 transition-transform hover:scale-105 ${config.paintColor === color.name ? 'scale-110' : ''}`}
                >
                  <div 
                    className={`h-12 w-12 rounded-full border-2 shadow-sm transition-all ${config.paintColor === color.name ? 'border-primary scale-110 ring-4 ring-primary/20' : 'border-transparent'}`}
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className={`text-[10px] font-bold uppercase ${config.paintColor === color.name ? 'text-primary' : 'text-muted-foreground'}`}>
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
              <Ruler className="h-6 w-6" />
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
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">5</span> Contact Details
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
                <FormLabel>Additional Requests & Amenities</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Tell us about custom shelving, electrical needs, specific doors/windows placement, or any other amenities you'd like..." 
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
