import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { AboutUs } from "@/components/AboutUs";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { VehicleCatalog } from "@/components/VehicleCatalog";
import { Footer } from "@/components/Footer";
import { siteConfig } from "@/config/siteConfig";
import { fetchVehiclesFromSupabase } from "@/lib/supabase";

// Render per request: Supabase credentials / admin data changes take effect
// without a rebuild, and SSR always includes the fleet.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Supabase when configured, seeded catalog (from siteConfig) otherwise.
  // Never throws.
  const vehicles = (await fetchVehiclesFromSupabase()) ?? siteConfig.carCatalog;

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <Header />
      <main className="flex-1">
        <Hero />
        <VehicleCatalog vehicles={vehicles} telegramHandle={siteConfig.telegramUsername} />
        <AboutUs />
        <WhyChooseUs />
      </main>
      <Footer />
    </div>
  );
}
