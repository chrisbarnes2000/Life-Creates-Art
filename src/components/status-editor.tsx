'use client';

import * as React from 'react';
import { useFirebase, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown } from 'lucide-react';

const STATUS_OPTIONS = ['Submitted', 'Scheduled', 'Completed', 'Cancelled'];

interface StatusEditorProps {
  requestId: string;
  customerId: string;
  currentStatus: string;
}

export function StatusEditor({
  requestId,
  customerId,
  currentStatus,
}: StatusEditorProps) {
  const { firestore } = useFirebase();
  const { toast } = useToast();

  const handleStatusChange = (newStatus: string) => {
    if (!firestore || newStatus === currentStatus) return;

    // Update the document in the global collection for admin view
    const globalRequestRef = doc(
      firestore,
      'allConsultationRequests',
      requestId
    );
    updateDocumentNonBlocking(globalRequestRef, { status: newStatus });

    // Also update the document in the user-specific subcollection for data consistency
    if (customerId) {
      const userRequestRef = doc(
        firestore,
        `customers/${customerId}/consultationRequests/${requestId}`
      );
      updateDocumentNonBlocking(userRequestRef, { status: newStatus });
    }

    toast({
      title: 'Status Updated',
      description: `Inquiry status changed to ${newStatus}`,
    });
  };

  const getBadgeVariant = (
    status: string
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'Completed':
        return 'default';
      case 'Scheduled':
        return 'secondary';
      case 'Cancelled':
        return 'destructive';
      case 'Submitted':
      default:
        return 'outline';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <Badge variant={getBadgeVariant(currentStatus)}>{currentStatus}</Badge>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {STATUS_OPTIONS.map((status) => (
          <DropdownMenuItem
            key={status}
            onSelect={() => handleStatusChange(status)}
            disabled={status === currentStatus}
          >
            {status}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
