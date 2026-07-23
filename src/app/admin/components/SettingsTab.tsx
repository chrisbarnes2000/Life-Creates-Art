import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Warehouse,
  DollarSign,
  Ruler,
  Grid,
  Wind,
  Droplets,
  Paintbrush,
  Globe,
  ToggleLeft,
  ArrowUpRight,
  ShieldCheck,
  Settings,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { useUserPreferences } from '@/context/UserPreferencesContext';

export function SettingsTab({
  config,
  setConfig,
  handleSaveSettings,
  testimonialsConfig,
  handleToggleTestimonials
}: any) {
  const { theme, setTheme, affiliateEnabled, setAffiliateEnabled } = useUserPreferences();

  const handleThemeChange = (newTheme: any) => {
    setConfig({ ...config, theme: newTheme });
    setTheme(newTheme);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-6 w-6 text-primary" />
              Gallery & Watermark Settings
            </CardTitle>
            <CardDescription>
              Configure image watermarking. Print pricing configuration is disabled until a partner print shop integration (CVS, Walmart, Costco, etc.) is established.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleSaveSettings} className="text-[10px] font-black uppercase tracking-widest">
            Save Settings
          </Button>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/10">
              <div className="space-y-1">
                <Label className="text-base font-bold">Enable Gallery Watermark</Label>
                <p className="text-xs text-muted-foreground">Display a text watermark overlay on all public gallery and portfolio images.</p>
              </div>
              <Switch 
                checked={config.watermarkEnabled}
                onCheckedChange={(checked) => setConfig({ ...config, watermarkEnabled: checked })}
              />
            </div>
            <div className="space-y-2 max-w-md">
              <Label className="font-bold text-sm">Watermark Overlay Text</Label>
              <Input 
                value={config.watermarkText || ''} 
                onChange={(e) => setConfig({ ...config, watermarkText: e.target.value })}
                placeholder="e.g. © Tina Barnes"
                className="h-10"
              />
              <p className="text-[11px] text-muted-foreground">This text will be dynamically overlaid onto high-resolution display views.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ToggleLeft className="h-6 w-6 text-primary" />
            Site Feature Toggles
          </CardTitle>
          <CardDescription>Control the visibility of dynamic sections on your homepage.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/10">
            <div className="space-y-1">
              <Label className="text-base font-bold">Public Testimonials</Label>
              <p className="text-xs text-muted-foreground max-w-[240px]">
                Temporarily hide the Testimonial Carousel and the "Share Your Experience" form from the public.
              </p>
            </div>
            <Switch
              checked={testimonialsConfig?.enabled ?? true}
              onCheckedChange={handleToggleTestimonials}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-t-8 border-t-emerald-900 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-emerald-600" />
            Partner & Affiliate Systems
          </CardTitle>
          <CardDescription>Control the architecture and visibility of the partnership network.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100">
             <div className="space-y-1">
                <Label className="text-base font-black uppercase tracking-tight">Affiliate Program Status</Label>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Enable the coming soon landing page and navigation entries</p>
             </div>
             <Switch 
               checked={affiliateEnabled} 
               onCheckedChange={setAffiliateEnabled}
               className="data-[state=checked]:bg-emerald-600"
             />
          </div>
          
          {affiliateEnabled && (
             <div className="p-4 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/20 flex items-center gap-4 animate-in fade-in slide-in-from-right-4">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <p className="text-xs font-medium text-emerald-900 dark:text-emerald-100 italic">
                   System integrated. The <span className="font-black uppercase tracking-widest text-[10px] bg-emerald-900 text-white px-2 py-0.5 rounded">/affiliate</span> endpoint is now public.
                </p>
             </div>
          )}
        </CardContent>
      </Card>

      <Button onClick={handleSaveSettings} className="w-full h-14 text-lg font-black uppercase tracking-tighter bg-amber-600 hover:bg-amber-700 text-white shadow-xl shadow-amber-200 dark:shadow-none">
        Secure All Live Changes
      </Button>
    </div>
  );
}
