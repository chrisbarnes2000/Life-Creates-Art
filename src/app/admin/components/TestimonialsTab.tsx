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
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  Check,
  Trash2,
  XCircle,
  Star,
  Tags,
} from 'lucide-react';

export function TestimonialsTab({
  liveTestimonials,
  isLoadingTestimonials,
  handleUpdateTestimonial,
  handleSetTestimonialCategory,
  handleDeleteTestimonial
}: any) {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Testimonial Moderation</CardTitle>
          <CardDescription>Review and approve customer testimonials for the public carousel.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTestimonials ? (
            <div className="flex justify-center py-12"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
          ) : !liveTestimonials || liveTestimonials.length === 0 ? (
            <div className="py-24 text-center text-muted-foreground">No testimonials submitted yet.</div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {liveTestimonials.map((t: any) => (
                <Card key={t.id} className={t.status === 'pending' ? 'border-accent/40 bg-accent/5 shadow-inner' : 'border-primary/10'}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row justify-between gap-6">
                      <div className="space-y-3 flex-grow">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-lg text-primary">{t.author}</span>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Tags className="h-3 w-3" /> {t.location}
                          </span>
                          <Badge variant={t.status === 'approved' ? 'default' : t.status === 'pending' ? 'secondary' : 'destructive'}>
                            {t.status.toUpperCase()}
                          </Badge>
                          {t.category && (
                            <Badge variant="outline" className="border-accent text-accent bg-accent/5">
                              {t.category.toUpperCase()}
                            </Badge>
                          )}
                          {t.date && <span className="text-xs text-muted-foreground ml-auto">Submitted {format(new Date(t.date.seconds * 1000), 'MMM d, yyyy')}</span>}
                        </div>
                        <div className="flex text-accent">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < t.rating ? 'fill-accent' : 'text-muted'}`} />
                          ))}
                        </div>
                        <p className="text-base italic text-foreground font-medium leading-relaxed bg-muted/20 p-4 rounded-lg">"{t.text}"</p>

                        <div className="flex items-center gap-2 pt-2">
                          <Label className="text-[10px] uppercase font-bold text-muted-foreground">Set Category:</Label>
                          <div className="flex gap-1">
                            {['Shed', 'Dome', 'Commercial'].map((cat) => (
                              <Button
                                key={cat}
                                size="sm"
                                variant={t.category === cat ? 'default' : 'outline'}
                                className="h-7 text-[10px] px-2"
                                onClick={() => handleSetTestimonialCategory(t.id, cat)}
                              >
                                {cat}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-2 shrink-0 justify-center">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-200 hover:bg-green-50 font-bold"
                          onClick={() => handleUpdateTestimonial(t.id, 'approved')}
                          disabled={t.status === 'approved'}
                        >
                          <Check className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-amber-600 border-amber-200 hover:bg-amber-50 font-bold"
                          onClick={() => handleUpdateTestimonial(t.id, 'rejected')}
                          disabled={t.status === 'rejected'}
                        >
                          <XCircle className="h-4 w-4 mr-1" /> Reject
                        </Button>
                        <Separator orientation="horizontal" className="my-1 hidden lg:block" />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 font-bold"
                          onClick={() => handleDeleteTestimonial(t.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
