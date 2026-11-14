import Seo from '@/components/Seo';
import JsonLd from '@/components/JsonLd';
import { useSiteUrl } from '@/components/Seo';
import { useSite } from '@/context/SiteContext';
import { assetUrl } from '@/lib/api';
import Hero from '@/components/home/Hero';
import CoreServices from '@/components/home/CoreServices';
import IndustriesGrid from '@/components/home/IndustriesGrid';
import Expertise from '@/components/home/Expertise';
import WhyChoose from '@/components/home/WhyChoose';
import Stats from '@/components/home/Stats';
import ProcessSteps from '@/components/sections/ProcessSteps';
import CtaBanner from '@/components/sections/CtaBanner';

function OrganizationSchema() {
  const { settings, services } = useSite();
  const base = useSiteUrl();
  const { company = {}, contact = {}, social = {}, seo = {} } = settings;
  const logo = assetUrl(company.logo || '/brand/logo.jpg');
  const data = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'LocalBusiness'],
    '@id': `${base}/#organization`,
    name: company.name,
    slogan: company.tagline,
    description: seo.defaultDescription,
    url: base,
    logo: /^https?:/.test(logo) ? logo : `${base}${logo}`,
    image: seo.ogImage,
    ...(contact.phone ? { telephone: contact.phone } : {}),
    ...(contact.email ? { email: contact.email } : {}),
    ...(contact.address ? { address: { '@type': 'PostalAddress', streetAddress: contact.address } } : {}),
    sameAs: Object.values(social).filter(Boolean),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Industrial automation and maintenance services',
      itemListElement: services.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.title, url: `${base}/services/${s.slug}` },
      })),
    },
  };
  return <JsonLd data={data} />;
}

export default function Home() {
  return (
    <>
      <Seo pageKey="home" />
      <OrganizationSchema />
      <Hero />
      <CoreServices />
      <IndustriesGrid />
      <Expertise />
      <ProcessSteps />
      <Stats />
      <WhyChoose />
      <CtaBanner />
    </>
  );
}
