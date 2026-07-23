'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShedCustomizer } from '@/components/shed-customizer';
import { GeometricDomes } from '@/components/geometric-domes';
import { Building, Globe } from 'lucide-react';

export function ShedDesigner() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle asChild>
          <h2 className="font-headline text-2xl md:text-3xl text-primary">
            Design Your Perfect Structure
          </h2>
        </CardTitle>
        <CardDescription>
          Choose a structure type and customize it to get an instant quote.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="domes" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="domes" className="flex items-center justify-center gap-2">
              <Globe className="h-5 w-5" />
              Geometric Domes
            </TabsTrigger>
            <TabsTrigger value="sheds" className="flex items-center justify-center gap-2">
              <Building className="h-5 w-5" />
              Classic Sheds
            </TabsTrigger>
          </TabsList>
          <TabsContent value="domes" className="mt-6">
            <GeometricDomes />
          </TabsContent>
          <TabsContent value="sheds" className="mt-6">
            <ShedCustomizer />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
