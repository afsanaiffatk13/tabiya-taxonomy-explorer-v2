import { ArrowRight, Briefcase, Lightbulb, Search, Globe } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Button, Card, CardContent } from '@components/ui';

export default function AboutPage() {
  const { lang = 'en' } = useParams<{ lang: string }>();

  const features = [
    {
      icon: Search,
      title: 'AI-Powered Search',
      description:
        'Find occupations and skills using natural language. Our semantic search understands what you mean, not just what you type.',
    },
    {
      icon: Briefcase,
      title: 'Comprehensive Occupations',
      description:
        'Explore over 3,000 occupations from both the formal "Seen Economy" and informal "Unseen Economy" including care work and domestic labor.',
    },
    {
      icon: Lightbulb,
      title: 'Skills Mapping',
      description:
        'Discover the skills, competencies, and knowledge areas associated with each occupation.',
    },
    {
      icon: Globe,
      title: 'Multi-Language Support',
      description:
        'Access the taxonomy in English and Spanish, with regional adaptations for South Africa.',
    },
  ];

  return (
    <div className="container-app py-12">
      {/* Hero Section */}
      <section className="mb-16 text-center">
        <h1 className="mb-4 text-3xl font-bold text-oxford-blue md:text-4xl">
          Tabiya Taxonomy Explorer
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-text-muted">
          Explore the comprehensive framework for categorizing all forms of work. Unlike
          traditional classifications, Tabiya recognizes both formal employment and the often
          invisible work that sustains communities.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to={`/${lang}/explore`}>
            <Button size="lg">
              Start Exploring
              <ArrowRight size={20} />
            </Button>
          </Link>
          <Link to={`/${lang}/occupations`}>
            <Button variant="secondary" size="lg">
              Browse Occupations
            </Button>
          </Link>
        </div>
      </section>

      {/* What is Tabiya Section */}
      <section className="mb-16">
        <Card className="bg-light-green">
          <CardContent>
            <h2 className="mb-4 text-2xl font-bold text-oxford-blue">
              What is the Tabiya Taxonomy?
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-lg font-semibold text-green-3">The Seen Economy</h3>
                <p className="text-oxford-blue">
                  Traditional, formal work recognized in labor markets. Based on ESCO (European
                  Skills, Competences, Qualifications and Occupations) classifications adapted for
                  African contexts.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-green-3">The Unseen Economy</h3>
                <p className="text-oxford-blue">
                  Informal work, care work, and domestic labor often invisible in economic
                  statistics. Based on ICATUS (International Classification of Activities for
                  Time-Use Statistics).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Features Grid */}
      <section className="mb-16">
        <h2 className="mb-8 text-center text-2xl font-bold text-oxford-blue">
          How to Use This Explorer
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description }) => (
            <Card key={title}>
              <CardContent>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-soft-green">
                  <Icon className="h-6 w-6 text-green-3" />
                </div>
                <h3 className="mb-2 font-semibold text-oxford-blue">{title}</h3>
                <p className="text-sm text-text-muted">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Getting Started */}
      <section>
        <h2 className="mb-6 text-center text-2xl font-bold text-oxford-blue">Getting Started</h2>
        <div className="mx-auto max-w-2xl">
          <ol className="space-y-4">
            <li className="flex gap-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-tabiya-green font-semibold text-oxford-blue">
                1
              </span>
              <div>
                <h3 className="font-semibold text-oxford-blue">Use the Explore tab</h3>
                <p className="text-text-muted">
                  Type natural language queries like "caring for elderly" or "growing vegetables" to
                  find relevant occupations and skills.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-tabiya-green font-semibold text-oxford-blue">
                2
              </span>
              <div>
                <h3 className="font-semibold text-oxford-blue">Browse the hierarchies</h3>
                <p className="text-text-muted">
                  Navigate through occupation and skill trees using the Occupations and Skills tabs
                  to see how categories are organized.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-tabiya-green font-semibold text-oxford-blue">
                3
              </span>
              <div>
                <h3 className="font-semibold text-oxford-blue">Explore connections</h3>
                <p className="text-text-muted">
                  Click on any item to see its full details, including related skills for
                  occupations and related occupations for skills.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>
    </div>
  );
}
