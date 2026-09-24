import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: September 19, 2026</p>

        <Card className="p-8 space-y-6 shadow-sm border-border">
          <CardContent className="space-y-6 pt-0 text-muted-foreground leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">1. Introduction</h2>
              <p>
                Welcome to <strong>LifeCreatesArt</strong> (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), the fine art portfolio and photography gallery of Tina Croft Barnes. Webmaster and technical lead: Chris Barnes (Founder of <a href="https://rapprt.space" target="_blank" rel="noopener noreferrer" className="text-primary underline">RapportVerse</a>). We respect your privacy and are committed to protecting your personal data.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">2. Information We Collect</h2>
              <p>
                When you visit our gallery, contact us for print inquiries, or subscribe to updates, we may collect minimal contact information such as your name, email address, and message contents. We also utilize standard analytics to understand visitor traffic and improve user experience.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">3. How We Use Your Information</h2>
              <p>
                Your information is used solely to respond to artwork inquiries, fulfill print orders, and provide updates regarding Tina Croft Barnes&apos; latest exhibitions and collections. We never sell, rent, or trade your personal data to third parties.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">4. Cookies & Local Storage</h2>
              <p>
                We use minimal local storage preferences to remember your theme settings (light/dark mode) and PWA installation state. You can clear these at any time via your browser settings.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">5. Contact Us</h2>
              <p>
                If you have any questions regarding this Privacy Policy, please reach out via our contact form or contact our Webmaster Chris Barnes at <a href="mailto:Chris.Barnes.2000@me.com" className="text-primary underline">Chris.Barnes.2000@me.com</a>.
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
