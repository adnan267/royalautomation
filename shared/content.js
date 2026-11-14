/**
 * Default website content for The Royal Automation.
 *
 * This single module is used in two places:
 *   1. backend/src/seed/seed.js  -> seeds MongoDB on first setup
 *   2. frontend (SiteContext)     -> offline fallback if the API is unreachable
 *
 * After seeding, ALL of this content is edited from the Admin Dashboard.
 * No phone numbers, emails, addresses, statistics, certifications, clients or
 * testimonials are invented here — those fields are intentionally left empty
 * until real details are entered by the administrator.
 *
 * Headings: wrap words in *asterisks* to render them in the brand red.
 *
 * Photography: free-licence images from Pexels (https://www.pexels.com/license/)
 * and Pixabay (https://pixabay.com/service/license-summary/), referenced by URL.
 * Replace them with your own project photos from Admin → Media Library.
 */

const px = (id, w = 1600) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

export const IMAGES = {
  hero: px(17842834, 2000),
  expertise: px(10699355, 1600),
  whyChoose: px(2183113, 1800),
  cta: px(221012, 2000),
  about: px(17842832, 1600),
  plc: px(257736),
  panel: px(5767595),
  drives: px(17842843),
  pcb: px(6755135),
  pcbAlt: px(12741836),
  pcbAlt2: px(10699354),
  motors: px(7859953),
  maintenance: px(10871737),
  electrical: px(17842832),
  upgrades: px(9242893),
  manufacturing: px(2183113),
  oilGas: px(14804593),
  energy: px(5884387),
  water: 'https://cdn.pixabay.com/photo/2017/10/07/16/27/treatment-plant-wastewater-2826990_1280.jpg',
  food: '',
  marine: px(1544372),
};

/* ------------------------------------------------------------------ */
/* Website settings (single document)                                  */
/* ------------------------------------------------------------------ */
export const defaultSettings = {
  company: {
    name: 'The Royal Automation',
    tagline: 'Leader in Industrial Maintenance',
    logo: '/brand/logo.jpg',
    shortIntro:
      'Industrial automation, repair and maintenance solutions for a smarter, more productive industry.',
    about: {
      heading: 'Engineering support that keeps industry running',
      paragraphs: [
        'The Royal Automation is an industrial automation and electrical engineering company focused on one goal: keeping our clients’ machines, processes and production lines running reliably.',
        'We support factories and industrial facilities with PLC programming, control panel design, drive and electronics repair, motor and machinery maintenance, and planned or emergency maintenance — combining hands-on troubleshooting with a structured engineering approach.',
        'Every job starts by understanding the problem properly. We inspect, diagnose, repair or implement, and then test thoroughly before handing equipment back, so you get a solution that lasts rather than a temporary fix.',
      ],
      mission:
        'To deliver practical, safe and dependable engineering solutions that reduce downtime and restore equipment to peak performance.',
      vision:
        'To be the maintenance partner industrial clients trust first when performance, safety and uptime matter.',
      values: [
        { title: 'Safety First', text: 'Safe isolation, safe work practices and safe hand-over on every job.', icon: 'ShieldCheck' },
        { title: 'Honest Diagnosis', text: 'We explain what failed, why it failed and what it will take to fix it.', icon: 'SearchCheck' },
        { title: 'Quality Workmanship', text: 'Neat wiring, proper documentation and thorough testing as standard.', icon: 'BadgeCheck' },
        { title: 'Responsive Support', text: 'Clear communication and quick response when your production is at stake.', icon: 'Headset' },
      ],
    },
  },
  contact: {
    // Left blank on purpose — enter real details in Admin → Settings → Contact.
    phone: '',
    phoneDisplay: '',
    email: '',
    whatsapp: '',
    whatsappMessage: 'Hello The Royal Automation, I would like to discuss an industrial service requirement.',
    address: 'Al Hail, Muscat, Sultanate of Oman',
    workingHours: '',
    // Shows the Al Hail area. For an exact pin, paste the “Embed a map” URL from Google Maps in the admin.
    mapEmbedUrl: 'https://www.google.com/maps?q=Al+Hail,+Muscat,+Sultanate+of+Oman&output=embed',
    mapLink: 'https://www.google.com/maps/search/?api=1&query=Al+Hail,+Muscat,+Sultanate+of+Oman',
  },
  social: { facebook: '', linkedin: '', instagram: '', youtube: '', x: '', tiktok: '' },
  home: {
    topBarText: 'Industrial Automation | Repair | Maintenance',
    hero: {
      headingLine1: 'Powering Industry.',
      headingLine2: 'Restoring Performance.',
      description:
        'Industrial automation, equipment repair and preventive maintenance solutions that keep your operations running.',
      primaryCta: { label: 'Request a Service', href: '/request-a-quote' },
      secondaryCta: { label: 'Explore Our Services', href: '/services' },
      image: IMAGES.hero,
      imageAlt: 'Industrial automation engineer working on an electrical control panel',
    },
    highlights: [
      { title: 'Expert Diagnostics', icon: 'Settings' },
      { title: 'Multi-Brand Support', icon: 'Handshake' },
      { title: 'Reliable Repairs', icon: 'ShieldCheck' },
      { title: 'Preventive Maintenance', icon: 'Wrench' },
    ],
    servicesSection: {
      heading: 'Our *Core* Services',
      subheading: 'Specialist automation, electrical and repair services for critical industrial equipment.',
    },
    industriesSection: {
      heading: 'Industries *We* Support',
      subheading: 'Hands-on engineering support across process, utility and manufacturing environments.',
    },
    expertise: {
      heading: 'Engineering That Keeps You *Moving*',
      description:
        'From complex automation systems to critical equipment repair, we deliver expert solutions tailored to your industrial needs.',
      features: [
        'Fault Diagnosis & Troubleshooting',
        'System Upgrades & Retrofits',
        'Installation & Commissioning',
        'Breakdown & Maintenance Support',
      ],
      image: IMAGES.expertise,
      imageAlt: 'Engineer repairing an industrial electronic circuit board',
    },
    process: {
      heading: 'A Clear Path to *Reliable* Performance',
      steps: [
        { title: 'Understand the Problem', text: 'We listen, gather fault history and define what “fixed” must look like.' },
        { title: 'Inspect & Diagnose', text: 'Systematic testing pinpoints the root cause — not just the symptom.' },
        { title: 'Repair & Implement', text: 'Repairs, programming or upgrades carried out to a documented scope.' },
        { title: 'Test & Support', text: 'Functional testing, hand-over and continued technical support.' },
      ],
    },
    whyChoose: {
      heading: 'Why Choose *The Royal Automation?*',
      items: [
        { title: 'Skilled Technical Team', text: 'Engineers and technicians experienced with automation, drives and industrial electronics.', icon: 'Users' },
        { title: 'Practical Engineering Solutions', text: 'Solutions sized to your plant, your budget and your production schedule.', icon: 'Lightbulb' },
        { title: 'Quality Workmanship', text: 'Tidy, documented, tested work that is easy to maintain later.', icon: 'Award' },
        { title: 'Safety-First Approach', text: 'Correct isolation, lock-out procedures and safe working on every site.', icon: 'ShieldCheck' },
        { title: 'Responsive Technical Support', text: 'Fast, clear communication when a breakdown is costing you production.', icon: 'Headset' },
      ],
      image: IMAGES.whyChoose,
    },
    cta: {
      heading: 'Need Reliable Industrial Support?',
      description: 'Let’s get your equipment back to peak performance.',
      buttonLabel: 'Talk to an Engineer',
      buttonHref: '/contact',
      image: IMAGES.cta,
    },
    // Animated statistics are only shown when real figures are entered in the admin panel.
    stats: [],
  },
  website: {
    showWhatsAppButton: true,
    showTopBar: true,
    quoteSuccessMessage:
      'Thank you — your request has been received. Our engineering team will review the details and contact you shortly.',
    contactSuccessMessage: 'Thank you for contacting us. A member of our team will get back to you shortly.',
    footerNote: '',
  },
  seo: {
    siteUrl: '',
    defaultTitle: 'The Royal Automation | Industrial Automation, Repair & Maintenance',
    titleTemplate: '%s | The Royal Automation',
    defaultDescription:
      'Industrial automation services in Muscat, Oman: PLC programming, control panel design, VFD and servo drive repair, industrial electronics repair and preventive maintenance.',
    ogImage: IMAGES.hero,
    keywords:
      'industrial automation services, industrial equipment repair, PLC programming services, electrical control panel repair, VFD repair services, servo drive repair, industrial electronics repair, preventive industrial maintenance, industrial automation Oman, industrial maintenance Muscat',
    pages: {
      home: { title: '', description: '' },
      about: {
        title: 'About Us',
        description:
          'Learn about The Royal Automation — an industrial automation, electrical engineering and equipment repair company focused on uptime, safety and quality workmanship.',
      },
      services: {
        title: 'Industrial Automation & Repair Services',
        description:
          'PLC programming, control panel design, VFD and servo drive repair, PCB repair, motor repair and preventive maintenance services for industrial facilities.',
      },
      industries: {
        title: 'Industries We Serve',
        description:
          'Automation, electrical and maintenance support for manufacturing, oil & gas, energy, water and wastewater, food & beverage and marine facilities.',
      },
      products: {
        title: 'Products & Spare Parts',
        description:
          'Industrial automation products and spare parts: PLC modules, HMIs, VFDs, servo drives, power supplies, sensors and switchgear. Enquire for availability.',
      },
      projects: {
        title: 'Projects & Our Work',
        description: 'Selected industrial automation, repair and maintenance projects delivered by The Royal Automation.',
      },
      contact: {
        title: 'Contact Us',
        description: 'Contact The Royal Automation for industrial automation, equipment repair and maintenance support.',
      },
      quote: {
        title: 'Request a Quote',
        description:
          'Request a quote for PLC programming, control panel work, drive repair, PCB repair, motor repair or maintenance services.',
      },
      privacy: { title: 'Privacy Policy', description: 'How The Royal Automation collects, uses and protects your information.' },
      terms: { title: 'Terms & Conditions', description: 'Terms and conditions for using The Royal Automation website and services.' },
    },
  },
};

/* ------------------------------------------------------------------ */
/* Services                                                            */
/* ------------------------------------------------------------------ */
export const services = [
  {
    slug: 'plc-programming-automation',
    title: 'PLC Programming & Automation',
    cardTitle: 'PLC Programming & Automation',
    icon: 'Cpu',
    image: IMAGES.plc,
    featured: true,
    order: 1,
    excerpt: 'New PLC logic, modifications, fault-finding and automation of machines and process lines.',
    intro:
      'Programmable logic controllers sit at the heart of modern machines and process lines. We write, modify, troubleshoot and document PLC programs so your automation runs safely, predictably and efficiently.',
    description: [
      'Whether you need a new control sequence for a machine, a change to an existing line, or help finding why a process keeps stopping, our engineers work through the logic methodically. We review the existing program, I/O and field devices before changing anything, and we back up and document every revision.',
      'We support multi-brand PLC platforms and the HMI/SCADA screens that go with them, including interlocks, alarms, recipes and communication between controllers, drives and instruments. Changes are tested in a controlled way, with your operators, before the system is handed back to production.',
    ],
    features: [
      'New PLC program development and machine sequencing',
      'Modification and optimisation of existing logic',
      'PLC fault diagnosis, I/O testing and online troubleshooting',
      'HMI screen design, alarms and operator interfaces',
      'Industrial communication setup between PLCs, drives and devices',
      'Program backup, version control and documentation',
    ],
    benefits: [
      'Less unplanned downtime caused by logic or I/O faults',
      'Safer machines with properly implemented interlocks',
      'Clear documentation that makes future maintenance easier',
      'Better throughput through optimised sequences',
    ],
    related: ['control-panel-design', 'automation-system-installation', 'industrial-system-upgrades'],
  },
  {
    slug: 'industrial-electrical-repair',
    title: 'Industrial Electrical Repair',
    cardTitle: 'Industrial Electrical Repair',
    icon: 'Zap',
    image: IMAGES.electrical,
    featured: false,
    order: 2,
    excerpt: 'Fault-finding and repair of industrial power, control and distribution circuits.',
    intro:
      'Electrical faults stop production fast. We trace and repair faults in industrial power distribution, motor control and control circuits — safely and with clear reporting.',
    description: [
      'Our technicians follow safe isolation procedures and use structured fault-finding to locate the actual cause of trips, intermittent faults and failed circuits. We repair or replace damaged cabling, terminations, protection devices, contactors, relays and control components.',
      'After repair, circuits are tested and verified before re-energising, and we explain what caused the failure so repeat faults can be prevented.',
    ],
    features: [
      'Electrical fault finding on power and control circuits',
      'Motor control centre (MCC) and starter repair',
      'Replacement of breakers, contactors, relays and overloads',
      'Cable, termination and wiring rectification',
      'Earthing and insulation checks',
      'Post-repair testing and fault reports',
    ],
    benefits: [
      'Faster return to production after electrical breakdowns',
      'Root-cause findings to prevent repeat failures',
      'Safer installations with correct protection',
      'Documented work for your maintenance records',
    ],
    related: ['control-panel-design', 'emergency-breakdown-support', 'preventive-maintenance'],
  },
  {
    slug: 'control-panel-design',
    title: 'Control Panel Design',
    cardTitle: 'Electrical Panel Design & Troubleshooting',
    icon: 'CircuitBoard',
    image: IMAGES.panel,
    featured: true,
    order: 3,
    excerpt: 'Design, build, modification and troubleshooting of electrical and automation control panels.',
    intro:
      'A well-designed control panel is safer, easier to maintain and more reliable. We design, build, modify and troubleshoot electrical and automation panels to suit your machine and site requirements.',
    description: [
      'We start from your functional requirements — the loads, I/O, environment and standards that apply — and develop the panel layout, component selection and wiring approach. Panels are built with clear labelling, organised wiring and appropriate protection and ventilation.',
      'For existing panels we carry out troubleshooting, modifications, component upgrades and re-wiring, and we update drawings so the documentation matches what is actually installed.',
    ],
    features: [
      'Control and power panel design and layout',
      'PLC, VFD and MCC panel assembly',
      'Electrical schematics and wiring diagrams',
      'Panel modification, retrofits and re-wiring',
      'Troubleshooting of existing panels',
      'Labelling, testing and documentation',
    ],
    benefits: [
      'Organised panels that are faster to fault-find',
      'Correctly rated protection and components',
      'Accurate drawings that match the installation',
      'A cleaner, safer and more maintainable system',
    ],
    related: ['plc-programming-automation', 'industrial-electrical-repair', 'automation-system-installation'],
  },
  {
    slug: 'vfd-servo-drive-repair',
    title: 'VFD & Servo Drive Repair',
    cardTitle: 'VFD & Servo Drive Repair',
    icon: 'Gauge',
    image: IMAGES.drives,
    featured: true,
    order: 4,
    excerpt: 'Diagnosis, repair, testing and parameter setup for AC drives and servo systems.',
    intro:
      'Variable frequency drives and servo drives control the speed and motion of critical equipment. When they fail, we diagnose, repair and test them — and help configure replacements when repair is not economical.',
    description: [
      'We investigate drive faults such as over-current, over-voltage, earth faults, communication errors and power-stage failures. Units are inspected, repaired at component level where practical, and tested before return.',
      'We also support on-site work: checking motors and cabling, reviewing parameters, tuning servo axes and commissioning replacement drives so the application runs as it should.',
    ],
    features: [
      'AC drive (VFD) fault diagnosis and repair',
      'Servo drive and servo motor troubleshooting',
      'Power section, control board and fan replacement',
      'Parameter backup, setup and tuning',
      'Drive replacement and commissioning',
      'Load testing before return where possible',
    ],
    benefits: [
      'Repair options that can reduce replacement costs',
      'Reduced downtime on speed-controlled equipment',
      'Correctly configured parameters for stable operation',
      'Advice on preventing repeat drive failures',
    ],
    related: ['pcb-industrial-electronics-repair', 'motor-machinery-repair', 'industrial-system-upgrades'],
  },
  {
    slug: 'pcb-industrial-electronics-repair',
    title: 'PCB & Industrial Electronics Repair',
    cardTitle: 'Industrial Electronics & PCB Repair',
    icon: 'Microchip',
    image: IMAGES.pcb,
    featured: true,
    order: 5,
    excerpt: 'Component-level repair of industrial circuit boards, controllers and power supplies.',
    intro:
      'Many industrial machines depend on electronic boards that are expensive or hard to replace. We repair industrial electronics at component level to bring equipment back into service.',
    description: [
      'Our electronics workbench handles control boards, power supply units, interface cards, HMI electronics and other industrial assemblies. We inspect for burnt components, failed semiconductors, capacitors, connectors and track damage, then repair and test.',
      'Where a board cannot be repaired economically, we tell you clearly and help you identify a suitable replacement or alternative.',
    ],
    features: [
      'Component-level PCB diagnosis and repair',
      'Industrial power supply (SMPS) repair',
      'Controller, interface and I/O card repair',
      'HMI and operator panel electronics repair',
      'Soldering, rework and track repair',
      'Functional bench testing after repair',
    ],
    benefits: [
      'Keeps older or hard-to-source equipment running',
      'Often more economical than full replacement',
      'Clear repair / not-repairable assessment',
      'Reduced spare-parts lead time issues',
    ],
    related: ['vfd-servo-drive-repair', 'plc-programming-automation', 'emergency-breakdown-support'],
  },
  {
    slug: 'motor-machinery-repair',
    title: 'Motor & Machinery Repair',
    cardTitle: 'Motors & Machinery Maintenance',
    icon: 'Cog',
    image: IMAGES.motors,
    featured: true,
    order: 6,
    excerpt: 'Testing, repair and maintenance of electric motors and industrial machinery.',
    intro:
      'Motors, pumps, fans, conveyors and production machines are the workhorses of any plant. We test, repair and maintain them to restore reliable operation.',
    description: [
      'We carry out electrical testing on motors — insulation resistance, winding checks and supply checks — and investigate mechanical issues such as bearing wear, misalignment and overheating.',
      'Machinery repairs are planned around your production so equipment returns to service quickly, with recommendations to reduce future failures.',
    ],
    features: [
      'Electric motor testing and fault diagnosis',
      'Bearing, coupling and alignment issues',
      'Pump, fan, conveyor and gearbox maintenance',
      'Machine electrical and mechanical troubleshooting',
      'Motor replacement and installation',
      'Condition observations and recommendations',
    ],
    benefits: [
      'Earlier detection of motor and machine problems',
      'Longer equipment life',
      'Lower energy losses from poorly running equipment',
      'Fewer unplanned stoppages',
    ],
    related: ['preventive-maintenance', 'vfd-servo-drive-repair', 'industrial-electrical-repair'],
  },
  {
    slug: 'preventive-maintenance',
    title: 'Preventive Maintenance',
    cardTitle: 'Preventive & Emergency Maintenance',
    icon: 'CalendarCheck',
    image: IMAGES.maintenance,
    featured: true,
    order: 7,
    excerpt: 'Planned inspection and maintenance programmes that prevent costly breakdowns.',
    intro:
      'The cheapest breakdown is the one that never happens. Our preventive maintenance programmes find developing problems early, while they are still simple to fix.',
    description: [
      'We work with you to define a maintenance scope and schedule for your electrical, automation and machinery assets — panels, drives, motors, PLC systems and critical utilities.',
      'Each visit includes inspection, cleaning, tightening, testing and reporting, with prioritised recommendations so you can plan corrective work and spare parts in advance.',
    ],
    features: [
      'Scheduled electrical and automation inspections',
      'Panel cleaning, tightening and thermal checks',
      'Drive, motor and PLC health checks',
      'Program and parameter backups',
      'Maintenance reports with prioritised actions',
      'Annual or custom maintenance plans',
    ],
    benefits: [
      'Fewer unplanned breakdowns',
      'Planned, budgeted maintenance instead of emergency spend',
      'Better visibility of equipment condition',
      'Improved safety and compliance',
    ],
    related: ['emergency-breakdown-support', 'motor-machinery-repair', 'industrial-electrical-repair'],
  },
  {
    slug: 'emergency-breakdown-support',
    title: 'Emergency Breakdown Support',
    cardTitle: 'Emergency Breakdown Support',
    icon: 'Siren',
    image: IMAGES.maintenance,
    featured: false,
    order: 8,
    excerpt: 'Rapid troubleshooting and repair when a breakdown stops production.',
    intro:
      'When a line stops, every hour counts. Our breakdown support focuses on getting you running again quickly and safely, then fixing the root cause properly.',
    description: [
      'Contact our team with the machine details, fault messages and what happened before the stop. We triage the problem, provide remote guidance where possible and attend site when required.',
      'Once production is restored, we follow up with a permanent repair plan and recommendations to reduce the chance of the same failure happening again.',
    ],
    features: [
      'Rapid fault triage and remote guidance',
      'On-site breakdown troubleshooting',
      'Temporary measures to restore production safely',
      'Permanent repair planning',
      'Spare-part identification',
      'Post-breakdown report',
    ],
    benefits: [
      'Reduced production losses during breakdowns',
      'A single point of contact for electrical and automation faults',
      'Safe, controlled recovery of equipment',
      'Lessons learned to prevent recurrence',
    ],
    related: ['preventive-maintenance', 'industrial-electrical-repair', 'pcb-industrial-electronics-repair'],
  },
  {
    slug: 'automation-system-installation',
    title: 'Automation System Installation',
    cardTitle: 'Automation System Installation',
    icon: 'Factory',
    image: IMAGES.plc,
    featured: false,
    order: 9,
    excerpt: 'Installation, wiring, testing and commissioning of automation and control systems.',
    intro:
      'We install and commission automation systems — from a single machine controller to complete control panels, field devices and networks.',
    description: [
      'Installation work covers panel mounting, cable routing, field wiring, instrument and sensor installation and network connections, carried out neatly and according to the drawings.',
      'Commissioning includes I/O checks, loop testing, functional testing of sequences and interlocks, operator familiarisation and final documentation.',
    ],
    features: [
      'Panel installation and field wiring',
      'Sensor, instrument and actuator installation',
      'Industrial network cabling and setup',
      'I/O and loop checking',
      'Functional testing and commissioning',
      'As-built documentation and hand-over',
    ],
    benefits: [
      'A single team from installation to commissioning',
      'Faster, smoother start-up',
      'Neat, traceable installation',
      'Operators trained on the new system',
    ],
    related: ['plc-programming-automation', 'control-panel-design', 'industrial-system-upgrades'],
  },
  {
    slug: 'industrial-system-upgrades',
    title: 'Industrial System Upgrades',
    cardTitle: 'Industrial System Upgrades',
    icon: 'RefreshCcw',
    image: IMAGES.upgrades,
    featured: false,
    order: 10,
    excerpt: 'Retrofits and upgrades of obsolete controls, drives and electrical systems.',
    intro:
      'Obsolete controllers, drives and HMIs become harder to support every year. We plan and carry out upgrades and retrofits that extend the life of your equipment.',
    description: [
      'We assess the existing system, identify obsolete or unsupported components and propose a staged upgrade path that fits your production schedule and budget.',
      'Upgrades can include PLC and HMI migration, drive replacement, panel retrofits and adding monitoring or communication capabilities — tested carefully to minimise disruption at switch-over.',
    ],
    features: [
      'Obsolescence assessment of controls and drives',
      'PLC and HMI migration',
      'Drive and starter upgrades',
      'Control panel retrofits',
      'Adding monitoring and data visibility',
      'Planned, low-disruption switch-over',
    ],
    benefits: [
      'Extended life of existing machinery',
      'Easier access to spare parts and support',
      'Improved reliability and functionality',
      'Investment planned in manageable stages',
    ],
    related: ['plc-programming-automation', 'vfd-servo-drive-repair', 'automation-system-installation'],
  },
];

/* ------------------------------------------------------------------ */
/* Industries                                                          */
/* ------------------------------------------------------------------ */
export const industries = [
  {
    slug: 'manufacturing-factories',
    title: 'Manufacturing & Factories',
    icon: 'Factory',
    image: IMAGES.manufacturing,
    order: 1,
    excerpt: 'Production lines, packaging machines and plant utilities.',
    description:
      'Manufacturing plants depend on automated machines, conveyors and utilities running shift after shift. We support production and maintenance teams with PLC troubleshooting, drive repair, panel work and planned maintenance.',
    applications: ['Production and assembly lines', 'Packaging machinery', 'Conveyors and material handling', 'Compressors and plant utilities'],
  },
  {
    slug: 'oil-gas',
    title: 'Oil & Gas',
    icon: 'Flame',
    image: IMAGES.oilGas,
    order: 2,
    excerpt: 'Control, electrical and maintenance support for oil & gas facilities.',
    description:
      'Oil and gas operations demand reliability and strict safety. We provide electrical and automation support for pumping, storage and process equipment, working to site permits and safety procedures.',
    applications: ['Pump and compressor controls', 'Motor control centres', 'Process instrumentation interfaces', 'Electrical maintenance'],
  },
  {
    slug: 'energy-power',
    title: 'Energy & Power',
    icon: 'Zap',
    image: IMAGES.energy,
    order: 3,
    excerpt: 'Electrical and control systems for power and utility installations.',
    description:
      'Power and utility installations rely on protection, control and auxiliary systems working correctly. We support control panels, auxiliary drives, motors and automation systems in energy facilities.',
    applications: ['Auxiliary motor and drive systems', 'Control and protection panels', 'Cooling and ventilation controls', 'Preventive electrical maintenance'],
  },
  {
    slug: 'water-wastewater',
    title: 'Water & Wastewater',
    icon: 'Droplets',
    image: IMAGES.water,
    order: 4,
    excerpt: 'Pump stations, treatment processes and their control systems.',
    description:
      'Water and wastewater systems run continuously and must stay available. We maintain and repair pump controls, VFDs, PLC systems and panels for treatment and pumping installations.',
    applications: ['Pump station controls', 'VFD-driven pumps and blowers', 'PLC and telemetry panels', 'Motor maintenance'],
  },
  {
    slug: 'food-beverage',
    title: 'Food & Beverage',
    icon: 'CupSoda',
    image: IMAGES.food,
    order: 5,
    excerpt: 'Processing, filling and packaging lines that must keep moving.',
    description:
      'Food and beverage lines operate on tight schedules where downtime means lost product. We support processing, filling, packaging and utility equipment with fast troubleshooting and planned maintenance.',
    applications: ['Filling and bottling lines', 'Processing equipment controls', 'Packaging and labelling machines', 'Refrigeration and utility controls'],
  },
  {
    slug: 'marine-industrial-facilities',
    title: 'Marine & Industrial Facilities',
    icon: 'Ship',
    image: IMAGES.marine,
    order: 6,
    excerpt: 'Electrical and automation support for marine and heavy industrial sites.',
    description:
      'Marine and heavy industrial environments are demanding on electrical and electronic equipment. We provide troubleshooting, electronics repair and maintenance for motors, drives, panels and control systems.',
    applications: ['Motor and pump systems', 'Drive and control panels', 'Electronics and PCB repair', 'Breakdown support'],
  },
];

/* ------------------------------------------------------------------ */
/* Products & spare parts                                              */
/* Generic categories only — no prices, stock levels or brand claims.  */
/* ------------------------------------------------------------------ */
export const productCategories = [
  'PLC & Control',
  'Drives & Motion',
  'HMI & Operator Interfaces',
  'Power & Protection',
  'Sensors & Instrumentation',
  'Repair & Exchange',
];

export const products = [
  {
    slug: 'plc-cpu-io-modules',
    name: 'PLC CPUs & I/O Modules',
    category: 'PLC & Control',
    image: IMAGES.plc,
    order: 1,
    excerpt: 'Controller CPUs, digital/analog I/O and communication modules.',
    description:
      'We help source PLC processors, I/O modules and communication cards for maintenance, spares and upgrades. Share the part number or the existing module details and our team will confirm availability and compatibility.',
    features: ['Processor / CPU modules', 'Digital and analog I/O cards', 'Communication and interface modules', 'Compatibility check before supply'],
    applications: ['Machine control', 'Process automation', 'Spares holding', 'System expansion'],
    availability: 'Enquire for availability',
  },
  {
    slug: 'ac-drives-vfd',
    name: 'AC Drives (VFDs)',
    category: 'Drives & Motion',
    image: IMAGES.drives,
    order: 2,
    excerpt: 'Variable frequency drives for pumps, fans, conveyors and machines.',
    description:
      'Variable frequency drives for speed control of AC motors. We can supply replacement drives, assist with sizing and carry out installation, parameter setup and commissioning.',
    features: ['Sizing support based on motor and load', 'Replacement of failed or obsolete drives', 'Parameter setup and commissioning', 'Optional repair of existing units'],
    applications: ['Pumps and fans', 'Conveyors', 'Mixers and agitators', 'Process machines'],
    availability: 'Enquire for availability',
  },
  {
    slug: 'servo-drives-motors',
    name: 'Servo Drives & Servo Motors',
    category: 'Drives & Motion',
    image: IMAGES.drives,
    order: 3,
    excerpt: 'Motion control drives and motors for precise positioning.',
    description:
      'Servo drives and motors for packaging, cutting, indexing and positioning applications. Send us the existing model details and we will advise on replacement, repair or upgrade options.',
    features: ['Servo amplifier and motor sourcing', 'Feedback device and cable checks', 'Axis setup and tuning support', 'Repair alternatives'],
    applications: ['Packaging machines', 'Indexing tables', 'Cut-to-length lines', 'Pick-and-place'],
    availability: 'Enquire for availability',
  },
  {
    slug: 'hmi-operator-panels',
    name: 'HMI Operator Panels',
    category: 'HMI & Operator Interfaces',
    image: IMAGES.pcbAlt,
    order: 4,
    excerpt: 'Touch panels and operator interfaces for machines and processes.',
    description:
      'Operator touch panels and interfaces for machine and process control. We support replacement, screen program transfer and new HMI projects.',
    features: ['Replacement HMI panels', 'Screen program backup and transfer', 'New screen development', 'Repair options for failed units'],
    applications: ['Machine operator stations', 'Process monitoring', 'Alarm handling', 'Recipe management'],
    availability: 'Enquire for availability',
  },
  {
    slug: 'industrial-power-supplies',
    name: 'Industrial Power Supplies',
    category: 'Power & Protection',
    image: IMAGES.pcbAlt2,
    order: 5,
    excerpt: 'DIN-rail and panel-mount power supplies for control systems.',
    description:
      'Regulated DC power supplies for control panels, PLC systems and field devices. We can supply replacements and repair selected units.',
    features: ['DIN-rail power supplies', 'Redundancy and buffer modules', 'Correct sizing for control loads', 'Repair of selected units'],
    applications: ['Control panels', 'PLC and I/O systems', 'Instrumentation', 'Network equipment'],
    availability: 'Enquire for availability',
  },
  {
    slug: 'switchgear-protection',
    name: 'Contactors, Relays & Circuit Breakers',
    category: 'Power & Protection',
    image: IMAGES.panel,
    order: 6,
    excerpt: 'Switching and protection components for panels and MCCs.',
    description:
      'Contactors, overload relays, control relays, MCBs and MCCBs for control panels and motor starters, selected to match your existing installation.',
    features: ['Contactors and overload relays', 'Control and timer relays', 'Miniature and moulded-case breakers', 'Matching to existing ratings'],
    applications: ['Motor starters', 'MCC panels', 'Distribution boards', 'Control circuits'],
    availability: 'Enquire for availability',
  },
  {
    slug: 'sensors-proximity-switches',
    name: 'Sensors & Proximity Switches',
    category: 'Sensors & Instrumentation',
    image: IMAGES.upgrades,
    order: 7,
    excerpt: 'Inductive, capacitive and photoelectric sensors and limit switches.',
    description:
      'Field sensors used in machine and process automation, including proximity, photoelectric and limit switches. We help identify suitable replacements.',
    features: ['Inductive and capacitive sensors', 'Photoelectric sensors', 'Limit switches', 'Replacement identification'],
    applications: ['Position detection', 'Product detection', 'Safety and limit sensing', 'Conveyor control'],
    availability: 'Enquire for availability',
  },
  {
    slug: 'repair-exchange-boards',
    name: 'Repair & Exchange Control Boards',
    category: 'Repair & Exchange',
    image: IMAGES.pcb,
    order: 8,
    excerpt: 'Repair service for industrial control boards and electronic assemblies.',
    description:
      'Send us your failed control board or electronic assembly for evaluation and repair. Where possible, we advise on exchange options to minimise downtime.',
    features: ['Evaluation and repair quotation', 'Component-level repair', 'Bench testing', 'Exchange options where available'],
    applications: ['Drive control boards', 'Machine controllers', 'Power boards', 'Interface cards'],
    availability: 'Enquire for availability',
  },
];

export default { defaultSettings, services, industries, products, productCategories, IMAGES };
