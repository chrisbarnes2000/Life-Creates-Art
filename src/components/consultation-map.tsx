'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Map, MapPin } from 'lucide-react';

interface ConsultationRequest {
  id: string;
  status: string;
}

interface ConsultationMapProps {
  requests: ConsultationRequest[] | null;
}

export function ConsultationMap({ requests }: ConsultationMapProps) {
  const pendingRequests = React.useMemo(() => {
    return (
      requests?.filter(
        (req) => req.status === 'Submitted' || req.status === 'Scheduled'
      ) || []
    );
  }, [requests]);

  const completedRequests = React.useMemo(() => {
    return requests?.filter((req) => req.status === 'Completed') || [];
  }, [requests]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Map className="h-6 w-6 text-primary" />
          <span>Project Status Map</span>
        </CardTitle>
        <CardDescription>
          A visual overview of pending and completed projects.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4 h-64 w-full overflow-hidden rounded-lg bg-muted">
          <Image
            src="https://placehold.co/800x400/e2e8f0/1e293b?text=Map+Placeholder"
            alt="Map of the Pacific Northwest"
            fill
            className="object-cover opacity-30"
            data-ai-hint="map pacific northwest"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <MapPin className="h-12 w-12 text-muted-foreground" />
            <p className="mt-2 font-semibold text-muted-foreground">
              Map Integration Placeholder
            </p>
            <p className="max-w-xs text-sm text-muted-foreground">
              To enable an interactive map, we'll need to integrate a mapping
              service and geocode customer addresses.
            </p>
          </div>
        </div>
        <div className="flex justify-around gap-4">
          <div className="text-center">
            <h4 className="font-bold text-2xl text-primary">
              {pendingRequests.length}
            </h4>
            <p className="text-sm text-muted-foreground">Pending</p>
          </div>
          <div className="text-center">
            <h4 className="font-bold text-2xl text-primary">
              {completedRequests.length}
            </h4>
            <p className="text-sm text-muted-foreground">Completed</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
