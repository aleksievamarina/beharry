import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { HowItWorks } from "@/components/how-it-works"
import { EventsSection } from "@/components/events-section"
import { WorkshopsSection } from "@/components/workshops-section"
import { MobileService } from "@/components/mobile-service"
import { ReservationSection } from "@/components/reservation-section"
import { VoucherSection } from "@/components/voucher-section"
import { Footer } from "@/components/footer"

export default function Page() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <ReservationSection />
      <EventsSection />
      <WorkshopsSection />
      <VoucherSection />
      <MobileService />
      <Footer />
    </main>
  )
}
