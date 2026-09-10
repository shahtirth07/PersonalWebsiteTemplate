import { palette } from '../scenes/sceneUtils';

/**
 * The narrative spine of the site. Each chapter pins a scene while its beats
 * scroll past. Copy is drawn from the resume and stays factual — the arc is
 * about problems and the systems built to solve them.
 */

export const chapters = [
  {
    id: 'foundations',
    navLabel: 'Foundations',
    eyebrow: 'Chapter 01',
    title: 'Start close to the metal',
    meta: '2020 — 2021 · Technikein Technologies, SOIL',
    accent: palette.amber,
    align: 'left',
    beats: [
      {
        id: 'circuits',
        label: 'Technikein Technologies · Electronics Intern',
        heading: 'Circuits first',
        body: 'Designed and programmed microcontroller circuits in C and Assembly on Arduino hardware. Working a few registers away from the silicon builds an instinct for cost that never really leaves you — every abstraction above it is something you know the price of.',
        tags: ['C', 'Assembly', 'Arduino', 'Embedded'],
      },
      {
        id: 'language',
        label: 'SOIL · AI/ML Intern',
        heading: 'Then teach a machine to read',
        body: 'Built a book recommendation system for the "Ask Anjlee" assistant using BERT and sentence transformers, with spaCy and NLTK handling the language pipeline. The goal was personalized educational support for underprivileged children — the first time a model I wrote had to be genuinely useful to someone.',
        tags: ['BERT', 'Sentence Transformers', 'spaCy', 'NLTK'],
      },
    ],
  },
  {
    id: 'scale',
    navLabel: 'Data at Scale',
    eyebrow: 'Chapter 02',
    title: 'Move the warehouse without stopping the trucks',
    meta: 'Oct 2021 — Jul 2024 · Onix (formerly Datametica)',
    accent: palette.teal,
    align: 'right',
    beats: [
      {
        id: 'framework',
        label: 'Migration framework',
        heading: 'Three legacy dialects, one target',
        body: 'Enterprises had years of logic locked inside DataStage, Informatica, and Alteryx. I architected a test-driven migration framework that could read all three and emit something modern, holding 95%+ test coverage across the translation layer.',
        stats: [
          { value: '95%+', label: 'test coverage' },
          { value: '60%', label: 'better compatibility' },
        ],
        tags: ['Groovy', 'Scala', 'TDD'],
      },
      {
        id: 'synthetic',
        label: 'Synthetic data',
        heading: 'You cannot test a migration on real customer data',
        body: 'So I built a generation pipeline that produced over a million records per run. Test cycles that used to serialize could finally run in parallel, and the team stopped losing 30 hours a month to manual QA.',
        stats: [
          { value: '1M+', label: 'records per run' },
          { value: '30 hrs', label: 'saved monthly' },
        ],
      },
      {
        id: 'pipelines',
        label: 'Delivery infrastructure',
        heading: 'Make shipping boring',
        body: 'Designed and maintained the CI/CD infrastructure several product teams depended on, across GitHub Actions and Jenkins. Deployments got more frequent and, more importantly, recovery from a bad one got dramatically faster.',
        stats: [
          { value: '+25%', label: 'deploy frequency' },
          { value: '40%', label: 'faster recovery' },
        ],
        tags: ['GitHub Actions', 'Jenkins', 'Docker'],
      },
      {
        id: 'microservices',
        label: 'Architecture',
        heading: 'Break the monolith apart',
        body: 'Led the migration from a monolith to Spring Boot microservices backed by PostgreSQL, with a React front end. API latency dropped by 80% and services could finally scale on their own terms instead of the slowest path.',
        stats: [
          { value: '80%', label: 'lower API latency' },
        ],
        tags: ['Spring Boot', 'PostgreSQL', 'React'],
      },
    ],
  },
  {
    id: 'production',
    navLabel: 'Production',
    eyebrow: 'Chapter 03',
    title: 'Ship to thirty institutions at once',
    meta: 'May 2024 — May 2026 · SAP UCC, Chico State',
    accent: palette.cyan,
    align: 'left',
    beats: [
      {
        id: 'discovery',
        label: 'Retrieval',
        heading: 'Fifty thousand items nobody could find',
        body: 'Architected a RAG-based agent for product discovery spanning 30+ institutional partners, embedding a 50K-item catalog for semantic search. Query relevance improved by 35% — people stopped guessing at keywords.',
        stats: [
          { value: '50K+', label: 'items embedded' },
          { value: '+35%', label: 'query relevance' },
        ],
        tags: ['RAG', 'Semantic Search', 'Embeddings'],
      },
      {
        id: 'realtime',
        label: 'Event pipeline',
        heading: 'Two hours late is the same as never',
        body: 'Notifications were arriving hours after the events that triggered them. I rebuilt the path around WebSockets, Redis pub/sub, and an event-driven core. Latency went from over two hours to under 500 milliseconds, holding for 10K+ concurrent users.',
        stats: [
          { value: '<500ms', label: 'from 2+ hours' },
          { value: '10K+', label: 'concurrent users' },
        ],
        tags: ['WebSockets', 'Redis', 'Event-Driven'],
      },
      {
        id: 'ownership',
        label: 'Full-stack ownership',
        heading: 'Sit with the people who use it',
        body: 'Owned a React and Node.js microservices platform end to end, and ran bi-weekly requirements sessions with stakeholders across 30+ institutions. Forward-deployed work means the roadmap is shaped in the room, then shipped inside the sprint.',
        tags: ['React', 'Node.js', 'Microservices'],
      },
    ],
  },
  {
    id: 'research',
    navLabel: 'Research',
    eyebrow: 'Chapter 04',
    title: 'Make the model admit what it does not know',
    meta: 'Sep 2024 — Present · California State University, Chico',
    accent: palette.violet,
    align: 'right',
    beats: [
      {
        id: 'grounding',
        label: 'Research Assistant',
        heading: 'Grounding beats fluency',
        body: 'Built RAG pipelines with grounding and evaluation frameworks for conversational AI. On noisy, real-world student input the hallucination rate fell by 40% — a model that says "I am not sure" is worth more than one that is confidently wrong.',
        stats: [
          { value: '40%', label: 'fewer hallucinations' },
        ],
        tags: ['RAG', 'Evaluation', 'Grounding'],
      },
      {
        id: 'publishing',
        label: 'Publications',
        heading: 'Then prove it in public',
        body: 'Co-authored four peer-reviewed publications on conversational agents and intelligent systems, with work presented at the ASEE Zone 4 Conference. Research keeps you honest: the reviewers do not care how elegant the code was.',
        stats: [
          { value: '4', label: 'peer-reviewed papers' },
        ],
      },
    ],
  },
  {
    id: 'agents',
    navLabel: 'Agents',
    eyebrow: 'Chapter 05',
    title: 'Systems that decide, not just respond',
    meta: 'Agentic AI · 2025 — Present',
    accent: palette.rose,
    align: 'left',
    beats: [
      {
        id: 'mockmouse',
        label: 'MockMouse',
        heading: 'An agent that drives the browser',
        body: 'A multi-agent orchestration system using Claude for autonomous task planning, turning natural language into sandboxed browser actions with isolated tool execution. The distributed runtime handles 10K+ concurrent task requests.',
        stats: [
          { value: 'Top 3', label: 'dev tools · Cal Hacks 2025' },
          { value: '9th', label: 'overall' },
        ],
        tags: ['Next.js', 'FastAPI', 'WebSockets', 'Prisma', 'Claude'],
        links: [{ label: 'Watch the demo', href: 'https://www.youtube.com/watch?v=iXucAiIWcFE' }],
      },
      {
        id: 'dejaquery',
        label: 'Déjà Query',
        heading: 'Pay for a question once',
        body: 'A dual-mode NL-to-SQL engine. The cold path compiles a question plus schema into SQL and stores it as a reusable template; the warm path recognizes a repeat and slot-fills it at zero LLM tokens. Repeated question patterns hit 95% token reuse, guarded by confidence thresholds and lexical safety rules.',
        stats: [
          { value: '95%', label: 'token reuse' },
          { value: '0', label: 'tokens on warm path' },
        ],
        tags: ['NL-to-SQL', 'Embeddings', 'MiniLM', 'Cost Analytics'],
      },
      {
        id: 'signalroom',
        label: 'Signal Room',
        heading: 'Agents with memory and a human in the loop',
        body: 'A multi-agent graph-based memory system on FalkorDB with live web retrieval for sales lead qualification. Agents coordinate across FastAPI and React over Apache Iggy event streaming, and an approval gate keeps a person on the business-critical decisions.',
        stats: [
          { value: '60%', label: 'less manual triage' },
        ],
        tags: ['FalkorDB', 'Apache Iggy', 'FastAPI', 'Human-in-the-loop'],
      },
      {
        id: 'chatbook',
        label: 'ChatBook',
        heading: 'Ask your coursework a question',
        body: 'A RAG pipeline for semantic document search that lets students query uploaded course materials conversationally. React front end, Flask backend, MongoDB Atlas as the vector store — deployed and iterated against 200+ real user sessions.',
        stats: [
          { value: '200+', label: 'user sessions' },
        ],
        tags: ['React', 'Flask', 'MongoDB Atlas', 'RAG'],
        links: [
          { label: 'Watch the demo', href: 'https://youtu.be/vVU7Bl2xuoA' },
          { label: 'Source', href: 'https://github.com/shahtirth07/PagePal' },
        ],
      },
    ],
  },
  {
    id: 'applied',
    navLabel: 'Applied',
    eyebrow: 'Chapter 06',
    title: 'Range, on purpose',
    meta: 'Recommenders, computer vision, mobile, platform',
    accent: palette.lime,
    align: 'right',
    beats: [
      {
        id: 'bookmatch',
        label: 'BookMatch',
        heading: 'Solve cold-start twice',
        body: 'A hybrid recommender over a 25K book catalog: collaborative filtering with scikit-learn KNN for users who have history, BERT embeddings for the ones who do not. Served through Elasticsearch with cosine similarity and validated against 200+ manually-tagged recommendations.',
        stats: [
          { value: '25K', label: 'book catalog' },
        ],
        tags: ['scikit-learn', 'BERT', 'Elasticsearch'],
      },
      {
        id: 'walnut',
        label: 'Walnut Counting System',
        heading: 'Count what the eye loses track of',
        body: 'A deep learning counting system built on dual CNN architectures, with custom PyTorch models using mixed-precision training and Apple MPS acceleration. The pipeline covers annotation, preprocessing, and evaluation across MAE, RMSE, F1, and ROC-AUC.',
        tags: ['PyTorch', 'CNN', 'Apple MPS', 'Computer Vision'],
      },
      {
        id: 'balancifi',
        label: 'BalanciFi',
        heading: 'Money, synced across devices',
        body: 'A personal finance app for tracking expenses, budgets, and savings with real-time cross-platform sync — Flutter for a responsive UI, Firebase Firestore for backendless storage and auth.',
        tags: ['Flutter', 'Dart', 'Firestore'],
        links: [{ label: 'Source', href: 'https://github.com/shahtirth07/BalanciFi' }],
      },
      {
        id: 'library',
        label: 'Library Management System',
        heading: 'The unglamorous platform work',
        body: 'A full-stack system on Spring Boot microservices, Angular, and PostgreSQL with role-based access. Thirty-plus REST APIs covering auth, catalog, checkout, and notifications, plus AI-assisted search through LangChain, deployed on GCP.',
        stats: [
          { value: '30+', label: 'REST APIs' },
        ],
        tags: ['Spring Boot', 'Angular', 'PostgreSQL', 'GCP'],
      },
    ],
  },
  {
    id: 'education',
    navLabel: 'Education',
    eyebrow: 'Chapter 07',
    title: 'The formal record',
    meta: 'Computer Science · Electronics & Telecommunication',
    accent: palette.cyan,
    align: 'left',
    beats: [
      {
        id: 'masters',
        label: 'California State University, Chico',
        heading: 'M.S. Computer Science',
        body: 'Graduate work under the shadow of Kendall Hall — conversational AI, retrieval systems, and computer graphics, carried alongside the research assistantship.',
        stats: [
          { value: '3.96', label: 'GPA / 4.0' },
          { value: '2024–26', label: 'Aug — Jul' },
        ],
      },
      {
        id: 'bachelors',
        label: 'Savitribai Phule Pune University',
        heading: 'B.E. Electronics & Telecommunication',
        body: 'An engineering foundation in signals, systems, and hardware — the load-bearing course underneath everything that came after, including a data science honors track.',
        stats: [
          { value: '3.74', label: 'GPA / 4.0' },
          { value: '2018–22', label: 'Aug — May' },
        ],
      },
    ],
  },
];

export const heroContent = {
  name: 'Tirth Shah',
  roles: ['Backend Engineer', 'AI Systems Architect', 'Published Researcher'],
  summary:
    'Backend engineer and AI systems architect with 3+ years building scalable services and agentic AI systems — distributed systems, multi-agent orchestration, and the production infrastructure underneath both.',
  location: 'Milpitas, California',
  scrollHint: 'Scroll to begin',
};

export const recognition = {
  publications: [
    {
      title:
        'AI Avatars as Dialogic Interfaces for Political Theory Instruction',
      venue: 'ASEE Zone IV Conference · peer.asee.org',
      year: '2025',
      authors: 'Shah, T. B. et al.',
      href: 'https://peer.asee.org/58397',
    },
    {
      title:
        'Extending Intelligent Discussion Boards with Video-Based Learning: Integrating Kaltura Video Analysis in ChatBook for Enhanced CS Education',
      venue: 'ASEE Zone IV Conference · peer.asee.org',
      year: '2025',
      authors: 'Shah, T. B. et al.',
      href: 'https://peer.asee.org/58414',
    },
    {
      title:
        'From confusion to clarity in introductory computer science through intelligent discussion board systems',
      venue:
        'Proceedings of the Consortium for Computing Sciences in Colleges, Rocky Mountain Conference (ACM), Orem, UT',
      year: '2025',
      authors: 'Shah, T. B., Tilekar, S., Sharma, K., Attarwala, A., & Lindoo, E.',
      href: 'https://dl.acm.org/doi/abs/10.5555/3778141.3778160',
    },
    {
      title: 'VIBERSHIELD: An Intrusion Detection System',
      venue:
        'International Journal for Research in Applied Science and Engineering Technology (IJRASET)',
      year: '2023',
      authors: 'Sardey, M. P., Shah, T., Joshi, P., & Shah, K.',
      href: 'https://doi.org/10.22214/ijraset.2023.48727',
    },
  ],
  certifications: [
    {
      title: 'Nebius AI CloudOps Engineer Certification',
      org: 'Nebius Academy',
      date: 'Sep 2026 — Sep 2029',
    },
    {
      title: 'AMD ROCm Certified Associate',
      org: 'AMD',
      date: 'Aug 2026 — Aug 2029',
      href: 'https://www.credly.com/badges/f13b0126-6557-4f02-aec5-51b6a1f560b6/public_url',
    },
    {
      title: 'AI Fluency Framework & Foundations',
      org: 'Anthropic',
      date: 'Jun 2026',
      href: 'https://verify.skilljar.com/c/pu98umpat39n',
    },
    {
      title: 'Claude 101',
      org: 'Anthropic',
      date: 'Jun 2026',
      href: 'https://verify.skilljar.com/c/3mgzbdusvxyf',
    },
    {
      title: 'The National Cyber League',
      org: 'Cyber Skyline',
      date: 'May 2025',
      href: 'https://cyberskyline.com/verify/N430DLGMYEGU',
    },
    {
      title: 'Introduction to Machine Learning',
      org: 'Coursera',
      date: 'Jun 2020',
      href: 'https://coursera.org/account/accomplishments/certificate/8RJCHCZWJ8ZT',
    },
    {
      title: 'Introduction to Internet of Things',
      org: 'Coursera',
      date: 'Jun 2020',
      href: 'https://coursera.org/account/accomplishments/certificate/DA76SZ6HAW6S',
    },
    {
      title: 'Introduction to Programming Using Python',
      org: 'Coursera',
      date: 'Jun 2020',
      href: 'https://coursera.org/account/accomplishments/specialization/certificate/XJZH22AL9FYL',
    },
  ],
  awards: [
    {
      title: 'Rising Star Award',
      org: 'Datametica Birds',
      date: 'June 2023',
      note: 'Recognized for outstanding performance and contribution to the team.',
    },
    {
      title: 'IEEE Trident 4.0 — Winner',
      org: 'IEEE, Pune',
      date: 'September 2019',
      note: 'First place for technical innovation and problem solving.',
    },
  ],
  leadership: [
    {
      title: 'Resident Advisor, University Housing',
      org: 'California State University, Chico',
      date: 'Aug 2025 — Present',
      note: 'Supporting and guiding students living in university housing.',
    },
    {
      title: 'Global Ally',
      org: 'California State University, Chico',
      date: 'Jan 2025 — Present',
      note: 'Helping international students navigate questions and challenges as they settle into campus life.',
    },
    {
      title: 'Co-Chairman, IEEE Student Branch',
      org: 'AISSMS IOIT',
      date: 'Mar 2021 — Feb 2022',
      note: 'Organized 20+ technical events and co-ran an IEEE international conference with 400+ paper presentations.',
    },
    {
      title: 'Head of Sponsorship',
      org: 'Alacrity, AISSMS IOIT',
      date: '2020',
      note: 'Led sponsor outreach and negotiations for a 60+ event intercollegiate festival.',
    },
  ],
};

export const contactLinks = {
  email: 'shahtirth126@gmail.com',
  phone: '+1 (530) 321-6233',
  linkedin: 'https://www.linkedin.com/in/shahtirth07/',
  github: 'https://github.com/shahtirth07',
  devpost: 'https://devpost.com/shahtirth07',
  resume: 'Tirth_Shah_Resume.pdf',
};
