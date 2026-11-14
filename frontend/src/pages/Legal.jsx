import { Link } from 'react-router';
import Seo from '@/components/Seo';
import PageHero from '@/components/ui/PageHero';
import { useSite } from '@/context/SiteContext';
import { IMAGES } from '@shared/content.js';

function LegalLayout({ pageKey, title, intro, sections }) {
  const { settings } = useSite();
  const updated = settings.updatedAt ? new Date(settings.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : null;
  return (
    <>
      <Seo pageKey={pageKey} title={title} />
      <PageHero title={title} image={IMAGES.panel} icon="ShieldCheck" crumbs={[{ label: title }]} />
      <section className="py-16 md:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-[260px_1fr]">
          <nav aria-label="On this page" className="hidden lg:block">
            <ul className="sticky top-28 space-y-2 border-l-2 border-line pl-4 text-sm">
              {sections.map((s) => <li key={s.id}><a href={`#${s.id}`} className="text-muted hover:text-brand">{s.title}</a></li>)}
            </ul>
          </nav>
          <article className="max-w-3xl">
            <p className="text-lg leading-relaxed text-ink">{intro}</p>
            {sections.map((s) => (
              <section key={s.id} id={s.id} className="mt-10 scroll-mt-32">
                <h2 className="font-display text-2xl font-extrabold uppercase text-navy">{s.title}</h2>
                <div className="prose-ra mt-3">{s.body.map((p) => <p key={p.slice(0, 30)}>{p}</p>)}</div>
              </section>
            ))}
            <p className="mt-12 rounded-lg bg-surface p-5 text-muted">
              Questions about this page? <Link to="/contact" className="font-semibold text-brand hover:underline">Contact us</Link>.
              {updated && <> Last updated: {updated}.</>}
            </p>
          </article>
        </div>
      </section>
    </>
  );
}

export function Privacy() {
  const { settings } = useSite();
  const name = settings.company?.name || 'The Royal Automation';
  return (
    <LegalLayout
      pageKey="privacy"
      title="Privacy Policy"
      intro={`This Privacy Policy explains how ${name} (“we”, “us”) collects, uses and protects personal information when you use this website or contact us about our services.`}
      sections={[
        { id: 'information', title: 'Information we collect', body: [
          'When you submit a contact or quote request form we collect the details you provide, such as your name, company name, email address, phone number, industry, equipment details, a description of your requirement and any files you choose to attach.',
          'Like most websites, our servers may automatically record technical information such as your IP address, browser type and the pages you visit. This is used for security and to keep the website working properly.',
        ] },
        { id: 'use', title: 'How we use your information', body: [
          'We use the information you provide to respond to your enquiry, prepare quotations, deliver the services you request, and communicate with you by your preferred contact method.',
          'We do not sell your personal information. We do not use your information for unrelated marketing without your consent.',
        ] },
        { id: 'sharing', title: 'Sharing of information', body: [
          'We may share information with trusted service providers who help us operate this website or deliver our services (for example hosting providers), only to the extent necessary and under appropriate confidentiality obligations.',
          'We may disclose information where required by law or to protect our rights, our customers or the public.',
        ] },
        { id: 'attachments', title: 'Files and attachments', body: [
          'Files uploaded through the quote form are stored securely and are accessible only to authorised staff. They are used solely to assess and respond to your request.',
        ] },
        { id: 'retention', title: 'Data retention and security', body: [
          'We keep enquiry information for as long as needed to respond to you and to maintain proper business records, after which it is deleted or anonymised.',
          'We use reasonable technical and organisational measures to protect your information. No method of transmission over the internet is completely secure, but we work to protect your data.',
        ] },
        { id: 'rights', title: 'Your choices and rights', body: [
          'You can ask us to access, correct or delete the personal information we hold about you, or to stop contacting you, by getting in touch through our contact page.',
        ] },
        { id: 'cookies', title: 'Cookies', body: [
          'This website does not use advertising or tracking cookies. A strictly necessary cookie is used only for signing in to the website administration area.',
          'Embedded content such as maps may be provided by third parties that set their own cookies under their own privacy policies.',
        ] },
        { id: 'changes', title: 'Changes to this policy', body: ['We may update this Privacy Policy from time to time. The latest version will always be published on this page.'] },
      ]}
    />
  );
}

export function Terms() {
  const { settings } = useSite();
  const name = settings.company?.name || 'The Royal Automation';
  return (
    <LegalLayout
      pageKey="terms"
      title="Terms & Conditions"
      intro={`These Terms & Conditions govern your use of the ${name} website. By using this website you agree to these terms.`}
      sections={[
        { id: 'website', title: 'Use of this website', body: [
          'The content on this website is provided for general information about our services and products. You agree to use the website lawfully and not to attempt to disrupt, damage or gain unauthorised access to it.',
        ] },
        { id: 'information', title: 'Accuracy of information', body: [
          'We aim to keep information on this website accurate and up to date, but it may not always be complete or current. Product information, availability and technical details should be confirmed with our team before you rely on them.',
        ] },
        { id: 'quotes', title: 'Quotations and services', body: [
          'Submitting a quote request does not create a contract. Any quotation we provide will set out its scope, pricing, validity and applicable terms. Services are delivered under the terms agreed in writing for each job.',
          'Diagnosis of faulty equipment may reveal additional issues. Where this affects scope or cost, we will contact you before proceeding.',
        ] },
        { id: 'safety', title: 'Technical guidance', body: [
          'Any general guidance provided through this website or by remote communication is not a substitute for on-site assessment by a qualified person. Electrical and automation equipment must only be worked on by competent personnel following appropriate safety procedures.',
        ] },
        { id: 'ip', title: 'Intellectual property', body: [
          'The website design, text and branding are owned by or licensed to us. Third-party trademarks or product names referred to on this website belong to their respective owners and are used for identification only.',
        ] },
        { id: 'liability', title: 'Limitation of liability', body: [
          'To the extent permitted by law, we are not liable for any loss arising from use of, or reliance on, information on this website. Nothing in these terms limits liability that cannot be limited by law.',
        ] },
        { id: 'links', title: 'External links', body: ['This website may link to external websites. We are not responsible for the content or practices of those websites.'] },
        { id: 'changes', title: 'Changes to these terms', body: ['We may update these terms from time to time. Continued use of the website after changes are published means you accept the updated terms.'] },
      ]}
    />
  );
}
