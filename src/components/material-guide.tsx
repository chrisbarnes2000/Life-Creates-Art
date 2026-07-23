import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

const materials = [
  {
    name: 'CDX Plywood',
    description:
      'An exterior-grade plywood that is moisture-resistant, making it ideal for the damp conditions of the Pacific Northwest. It provides a strong, stable base for your shed.',
    benefits: ['Moisture Resistant', 'Structural Strength', 'Durable & Long-lasting'],
    imageId: 'material-plywood',
  },
  {
    name: 'T1-11 Siding',
    description:
      'A wood siding product known for its distinctive grooved appearance and excellent durability. It stands up well to rain and wind, providing a robust and attractive exterior.',
    benefits: ['Weather-Resistant', 'Natural Wood Look', 'Impact Resistant'],
    imageId: 'material-siding',
  },
];

export function MaterialGuide() {
  return (
    <Card>
      <CardHeader>
        <CardTitle asChild>
          <h2 className="text-primary h3">PNW Material Guide</h2>
        </CardTitle>
        <CardDescription>
          Our commitment to quality for your peace of mind.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          We use only high-quality materials proven to withstand Pacific
          Northwest weather.
        </p>
        {materials.map((material) => {
          const image = PlaceHolderImages.find((p) => p.id === material.imageId);
          return (
            <div key={material.name} className="space-y-3">
              {image && (
                <Image
                  src={image.imageUrl}
                  alt={material.name}
                  width={400}
                  height={200}
                  className="aspect-video w-full rounded-lg object-cover"
                  data-ai-hint={image.imageHint}
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              )}
              <h4 className="text-lg font-semibold">{material.name}</h4>
              <p className="text-sm">{material.description}</p>
              <ul className="space-y-1">
                {material.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
