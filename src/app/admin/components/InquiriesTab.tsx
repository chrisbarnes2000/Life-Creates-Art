import * as React from 'react';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Loader2, Plus, Trash2, GitMerge, Mail, Phone, Calendar, User, FileText } from 'lucide-react';
import { StatusEditor } from '@/components/status-editor';
import { ConsultationMap } from '@/components/consultation-map';
import { ManualRequestForm } from '@/components/manual-request-form';

interface MergeDialogProps {
  currentReq: any;
  allRequests: any[];
  onMerge: (sourceId: string, destId: string) => void;
}

function MergeDialog({ currentReq, allRequests, onMerge }: MergeDialogProps) {
  const [selectedDestId, setSelectedDestId] = React.useState<string>('');
  const [isOpen, setIsOpen] = React.useState(false);
  
  const mergeTargets = React.useMemo(() => {
    return allRequests.filter(r => r.id !== currentReq.id);
  }, [allRequests, currentReq.id]);

  const handleConfirmMerge = () => {
    if (!selectedDestId) return;
    onMerge(currentReq.id, selectedDestId);
    setIsOpen(false);
    setSelectedDestId('');
  };

  const formatRequestDate = (dateVal: any) => {
    if (!dateVal) return 'Date unknown';
    try {
      const d = typeof dateVal.toDate === 'function' ? dateVal.toDate() : new Date(dateVal);
      return format(d, 'MMM d, h:mm a');
    } catch (e) {
      return 'Invalid Date';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-primary hover:bg-primary/10 hover:text-primary rounded-lg transition-all"
          title="Merge with other inquiry"
        >
          <GitMerge className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitMerge className="h-5 w-5 text-primary" />
            <span>Merge Inquiry Details</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="text-sm text-muted-foreground leading-relaxed">
            You are merging the details of <strong>{currentReq.name}</strong>&apos;s inquiry ({currentReq.configSummary || 'No details'}) into a destination inquiry. 
            This inquiry will be deleted, and its configuration and notes will be combined into the selected destination inquiry.
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Select Destination Inquiry
            </label>
            <select
              value={selectedDestId}
              onChange={(e) => setSelectedDestId(e.target.value)}
              className="w-full p-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all border-input"
            >
              <option value="">-- Choose target inquiry --</option>
              {mergeTargets.map((req) => (
                <option key={req.id} value={req.id}>
                  {req.name} ({req.email}) - {req.configSummary ? req.configSummary.substring(0, 35) + '...' : 'No details'} - {formatRequestDate(req.requestDate)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t pt-4">
          <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            size="sm" 
            onClick={handleConfirmMerge} 
            disabled={!selectedDestId}
            className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold flex items-center gap-1"
          >
            Confirm & Merge
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function InquiriesTab({ 
  requests, 
  isLoadingReqs, 
  handleDeleteAllInquiries,
  handleDeleteInquiry,
  handleMergeInquiries
}: { 
  requests: any[], 
  isLoadingReqs: boolean, 
  handleDeleteAllInquiries?: () => void,
  handleDeleteInquiry?: (id: string, customerId?: string) => void,
  handleMergeInquiries?: (sourceId: string, destId: string) => void
}) {

  const formatRequestDate = (dateVal: any) => {
    if (!dateVal) return 'Date unknown';
    try {
      const d = typeof dateVal.toDate === 'function' ? dateVal.toDate() : new Date(dateVal);
      return format(d, 'MMM d, h:mm a');
    } catch (e) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="space-y-8">
      <ConsultationMap requests={requests} />
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Customer Inquiries</CardTitle>
            <CardDescription>Manage consultation requests.</CardDescription>
            {requests && requests.length > 0 && !isLoadingReqs && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="p-0 h-auto text-destructive text-xs font-bold flex items-center gap-1 group"
                  >
                    <Trash2 className="h-3 w-3 opacity-70 group-hover:opacity-100" />
                    Clear All Inquiries
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will permanently delete all {requests.length} customer inquiries from both the global records and individual customer histories. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteAllInquiries}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Request
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Manual Request</DialogTitle>
              </DialogHeader>
              <ManualRequestForm />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingReqs ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : !requests || requests.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No inquiries yet.</div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {requests.map((req) => (
                <div 
                  key={req.id} 
                  className="group relative p-5 border border-primary/10 hover:border-primary/20 rounded-xl bg-card hover:bg-muted/40 shadow-xs hover:shadow-md transition-all duration-300 md:flex md:items-center md:justify-between gap-4 border-l-4 border-l-primary/30 hover:border-l-primary"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-headline font-bold text-base text-card-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                        <User className="h-4 w-4 text-primary/70" />
                        {req.name}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 bg-muted px-2 py-0.5 rounded-full font-mono">
                        <Calendar className="h-3.5 w-3.5 opacity-60" />
                        {formatRequestDate(req.requestDate)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5 opacity-60" />
                        {req.email}
                      </span>
                      {req.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 opacity-60" />
                          {req.phone}
                        </span>
                      )}
                    </div>

                    {req.configSummary ? (
                      <div className="mt-2 text-xs font-mono text-primary/95 bg-primary/5 dark:bg-primary/10 px-3 py-2 rounded-lg border border-primary/10 flex items-start gap-1.5 max-w-2xl leading-relaxed">
                        <FileText className="h-3.5 w-3.5 mt-0.5 text-primary/70 flex-shrink-0" />
                        <div>
                          <span className="font-bold mr-1 text-primary">Configuration:</span>
                          {req.configSummary}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 text-xs text-muted-foreground italic">No configurations specified</div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4 md:mt-0 flex-shrink-0 border-t pt-3 md:border-none md:pt-0">
                    <StatusEditor requestId={req.id} customerId={req.customerId} currentStatus={req.status} />

                    <div className="flex items-center gap-1.5 ml-2 border-l pl-2 border-border">
                      {/* Merge option */}
                      {requests.length > 1 && handleMergeInquiries && (
                        <MergeDialog 
                          currentReq={req} 
                          allRequests={requests} 
                          onMerge={handleMergeInquiries} 
                        />
                      )}

                      {/* Delete option */}
                      {handleDeleteInquiry && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg transition-all"
                              title="Delete Inquiry"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure you want to delete this inquiry?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action will permanently delete the inquiry from <strong>{req.name}</strong> ({req.email}). This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteInquiry(req.id, req.customerId)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

