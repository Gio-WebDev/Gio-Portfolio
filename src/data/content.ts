export const profile = {
  email: 'lopezjgm999@gmail.com',
  github: 'https://github.com/Gio-WebDev',
  linkedin: 'https://www.linkedin.com/in/jose-giovanni-miguel-lopez-aa8972449/',
}

export interface Project {
  id: string
  number: string
  title: string
  subtitle: string
  category: string
  description: string
  filters: string[]
  technologies: string[]
  role: string
  context: string
  overview: string
  purpose: string
  users: string
  features: string[]
  featureLabel: string
  contributions: string[]
  verification: string
  repo?: string
  repoVerified?: boolean
  demo?: string
  demoVerified?: boolean
}

export const projects: Project[] = [
  {
    id: 'poseidon',
    number: '01',
    title: 'POSEIDON',
    subtitle: 'Smart Pond With Dynamic Observation Network',
    category: 'Capstone · Web / Mobile / IoT',
    description:
      'Helping freshwater fishpond operators make sense of water quality, one reading at a time.',
    filters: ['Web & mobile'],
    technologies: [
      'React.js',
      'PHP',
      'Flutter',
      'Firebase / Cloud Firestore',
      'ESP32',
      'Water quality sensors',
    ],
    role: 'Web development, UI design & documentation',
    context: 'Academic capstone · Three-member team',
    overview:
      'An IoT-based freshwater fishpond monitoring and management system. POSEIDON brings water quality observations and pond management tools together in web and mobile interfaces.',
    purpose:
      'Support fishpond operators in monitoring important water quality parameters and responding to conditions through alerts, configurable thresholds, and automated partial water exchange.',
    users:
      'Freshwater fishpond operators and the workers assigned to their ponds.',
    features: [
      'pH, dissolved oxygen, and water temperature monitoring',
      'Sensor readings at five-minute intervals',
      'Monitoring dashboard and historical data visualization',
      'Worker and pond assignment management',
      'Customizable water quality thresholds',
      'Alerts and notifications',
      'Report generation',
      'Automated partial water exchange using a pump and solenoid valve',
    ],
    featureLabel: 'Documented features supplied by Gio',
    contributions: [
      'Web development as part of a three-member development team',
      'UI design for the project',
      'Preparation of project documentation',
      'Preparation and presentation during the capstone defense',
    ],
    verification:
      'Based on the project information supplied by Gio. The capstone paper, source code, and screenshots are not yet included for independent review. Firebase and ESP32 belong to the team’s stack; hardware engineering and advanced individual Firebase expertise are not claimed. The supplied admin URL requires a login; live availability has not been independently verified.',
    demo: 'https://poseidon-admin.online/index.php?page=login',
    demoVerified: false,
  },
  {
    id: 'hanap',
    number: '02',
    title: 'HANAP',
    subtitle: 'Local skills. Meaningful connections.',
    category: 'Web & mobile application',
    description:
      'Connecting clients with local skilled workers through a centralized service platform.',
    filters: ['Web & mobile'],
    technologies: ['React.js', 'Flutter', 'Supabase'],
    role: 'Full-Stack Developer & UI Designer',
    context: 'Individual academic project',
    overview:
      'HANAP is a web and mobile academic project for connecting people who need a service with local skilled workers. It brings service discovery, requests, bookings, and transactions into one system.',
    purpose:
      'Make it easier for clients to find local service providers and for workers to discover and manage service requests.',
    users:
      'Clients looking for local services, skilled workers offering services, and platform administrators.',
    features: [
      'User registration and authentication',
      'Client and worker dashboards',
      'Worker profiles and service listings',
      'Job posting, search, and filtering',
      'Booking management and job acceptance workflow',
      'Service tracking',
      'Ratings and reviews',
      'Admin dashboard',
    ],
    featureLabel: 'Features reported by Gio',
    contributions: [
      'Full-stack development of an individual academic project',
      'UI design for the web and mobile experience',
    ],
    verification:
      'Project scope, features, and individual role are supplied by Gio. Source code and screenshots are not available here, so implementation details and reported features await independent verification. No public repository or live demo has been supplied.',
  },
  {
    id: 'brewbite',
    number: '03',
    title: 'BrewBite-MVC',
    subtitle: 'Coffee, comforting bites, and a little pause.',
    category: 'Academic web application',
    description:
      'A café web project built with PHP and MVC, with a homepage introducing coffee, food, and pickup ordering.',
    filters: ['Web & mobile'],
    technologies: ['PHP', 'MVC architecture'],
    role: 'Individual contribution awaiting confirmation',
    context: 'Academic project',
    overview:
      'BrewBite-MVC is an academic PHP web application using MVC architecture. The supplied homepage screenshot presents BrewBite as a café, with coffee and food messaging, a menu entry point, and order-ahead pickup information.',
    purpose:
      'Introduce the café and guide visitors toward its menu and pickup-ordering entry points. The screenshot establishes the interface’s purpose; the underlying ordering implementation has not been verified.',
    users: 'Café visitors browsing food and drinks or looking for pickup-ordering information.',
    features: [
      'Café homepage with coffee photography and food-and-drink messaging',
      'Navigation links for the menu, café story, login, and joining BrewBite',
      'Order now and Explore our menu entry points',
      'Order-ahead and cash-on-pickup information',
    ],
    featureLabel: 'Visible in the supplied homepage screenshot',
    contributions: [
      'Gio’s specific contributions need confirmation before this case study can be expanded.',
    ],
    verification:
      'The homepage screenshot is supplied by Gio and shows the interface described here. PHP and MVC architecture come from the original project brief. Source code, README, and database schema remain unavailable, and the repository could not be accessed for review. Working authentication, ordering, database use, and Gio’s individual contributions are not confirmed by the screenshot.',
    repo: 'https://github.com/Gio-WebDev/BrewBite-MVC',
    repoVerified: false,
  },
  {
    id: 'rizal',
    number: '04',
    title: 'Buhay ni Rizal',
    subtitle: 'Laro ng Kaalaman — an academic educational game.',
    category: 'Academic educational game',
    description:
      'An educational game project related to the life and history of Dr. José Rizal.',
    filters: ['Educational'],
    technologies: [],
    role: 'Academic project participant',
    context: 'Academic educational project',
    overview:
      'Buhay ni Rizal: Laro ng Kaalaman is an academic educational game related to the life and history of Dr. José Rizal. The supplied screenshot shows a Filipino-language main menu set in an illustrated library. The original source code is unavailable.',
    purpose:
      'Explore an educational subject through an academic game project centered on Dr. José Rizal.',
    users:
      'Educational audience; the specific target learner group is not documented.',
    features: [
      'Filipino-language main menu titled Buhay ni Rizal: Laro ng Kaalaman',
      'Visible Magsimula, Tagumpay, and Umalis menu entries',
      'Illustrated library setting and an audio-control icon',
    ],
    featureLabel: 'Visible in the supplied main-menu screenshot',
    contributions: [
      'Specific individual responsibilities have not yet been supplied.',
    ],
    verification:
      'The supplied screenshot verifies the title and visible main-menu interface. Source code remains unavailable. The game engine, technologies, gameplay mechanics, behavior of the menu controls, team structure, and specific individual contributions are not confirmed. No repository or live demo is available.',
  },
]

export const skills = [
  {
    title: 'Design & experience',
    items: [
      'Figma',
      'UI Design',
      'Basic UX Design',
      'Responsive Interface Design',
    ],
    note: 'My strongest area of interest.',
  },
  {
    title: 'Frontend development',
    items: ['React.js', 'HTML5', 'CSS3', 'JavaScript'],
  },
  {
    title: 'Languages & backend',
    items: ['Java', 'PHP', 'JavaScript', 'HTML', 'CSS', 'SQL'],
  },
  { title: 'Mobile development', items: ['Flutter', 'Dart'] },
  { title: 'Data & services', items: ['MySQL', 'Supabase'] },
  {
    title: 'Development tools',
    items: ['Git', 'GitHub', 'Visual Studio Code', 'XAMPP'],
    note: 'Basic proficiency in Git and GitHub.',
  },
]
