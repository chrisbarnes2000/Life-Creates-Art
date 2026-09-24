import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: September 19, 2026</p>

        <Card className="p-8 space-y-6 shadow-sm border-border">
          <CardContent className="space-y-6 pt-0 text-muted-foreground leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">1. Agreement to Terms</h2>
              <p>
                By accessing or using <strong>LifeCreatesArt</strong> (operated by Tina Croft Barnes; webmaster Chris Barnes / RapportVerse), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the platform.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">2. Intellectual Property & Copyright</h2>
              <p>
                All fine art photographs, digital gallery images, text, design elements, and logos displayed on LifeCreatesArt are the exclusive property of Tina Croft Barnes and protected by international copyright laws. Unauthorized reproduction, downloading, or commercial redistribution is strictly prohibited without prior written consent.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">3. Print Purchases & Commissions</h2>
              <p>
                Inquiries and orders for fine art prints and custom commissions are subject to availability and individual agreement. Pricing and fulfillment details are communicated directly through our verified contact channels.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">4. Limitation of Liability</h2>
              <p>
                LifeCreatesArt and its operators shall not be held liable for any indirect, incidental, or consequential damages arising from the use of this website or the purchase of displayed works.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">5. Governing Law</h2>
              <p>
                These terms are governed by and construed in accordance with applicable local and federal laws without regard to conflict of law principles.
              </p>
            </section>

            <div className="pt-6 border-t border-border">
              <Link href="/" className="text-primary hover:underline font-medium">
                &larr; Return to Home Gallery
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
