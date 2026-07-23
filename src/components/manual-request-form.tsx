'use client';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';

const manualRequestSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  configSummary: z.string().min(5),
});

export function ManualRequestForm() {
  const { firestore, auth } = useFirebase();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof manualRequestSchema>>({
    resolver: zodResolver(manualRequestSchema),
    defaultValues: { name: '', email: '', phone: '', configSummary: '' },
  });

  async function onSubmit(values: z.infer<typeof manualRequestSchema>) {
    if (!firestore || !auth?.currentUser) {
      toast({ variant: 'destructive', title: 'Error', description: 'Authentication required.' });
      return;
    }
    try {
      const consultationRequestsRef = collection(firestore, 'allConsultationRequests');
      const newRequestRef = doc(consultationRequestsRef);
      await setDoc(newRequestRef, {
        ...values,
        id: newRequestRef.id,
        customerId: auth.currentUser.uid,
        requestDate: serverTimestamp(),
        status: 'Submitted',
        manual: true,
      });
      toast({ title: 'Request added', description: 'Manual request has been added.' });
      form.reset();
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to add request.' });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="phone" render={({ field }) => (
          <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="configSummary" render={({ field }) => (
          <FormItem><FormLabel>Details</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <Button type="submit">Add Request</Button>
      </form>
    </Form>
  );
}
