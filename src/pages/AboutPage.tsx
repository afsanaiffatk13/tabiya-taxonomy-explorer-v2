import { Link, useParams } from 'react-router-dom';

export default function AboutPage() {
  const { lang = 'en' } = useParams<{ lang: string }>();

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-soft-green px-6 py-6 md:px-16 md:py-10">
        <div className="mx-auto flex max-w-[854px] flex-col items-center gap-4 text-center md:gap-6">
          {/* Text */}
          <div className="flex flex-col gap-2 md:gap-3">
            <h1 className="text-2xl font-bold leading-[1.1] tracking-[-0.5px] text-oxford-blue md:text-[30px]">
              A Skills-First Taxonomy for
              <br />
              Inclusive Labor Markets
            </h1>
            <p className="text-sm font-medium leading-[1.45] tracking-[-0.09px] text-green-3 md:text-base md:tracking-[-0.12px]">
              Recognizing the full spectrum of human capital, from formal employment
              to caregiving, from paid work to community contribution.
            </p>
          </div>
          {/* Buttons */}
          <div className="flex w-full flex-col gap-4 md:w-auto md:flex-row">
            <a
              href="https://docs.tabiya.org/our-tech-stack/inclusive-livelihoods-taxonomy"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto"
            >
              <button className="w-full rounded-xl bg-green-3 px-4 py-3 text-lg font-medium leading-[1.45] tracking-[-0.09px] text-soft-green transition-colors hover:bg-oxford-blue md:w-auto">
                Our Methodology
              </button>
            </a>
            <Link to={`/${lang}/explore`} className="w-full md:w-auto">
              <button className="w-full rounded-xl bg-tabiya-green px-4 py-3 text-lg font-medium leading-[1.45] tracking-[-0.09px] text-oxford-blue transition-colors hover:bg-oxford-blue hover:text-soft-green md:w-auto">
                Start exploring
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-soft-green py-4 md:py-6">
        <div className="container-app">
          <div className="flex flex-col items-center justify-center gap-6 md:flex-row md:gap-0">
            {/* Occupations */}
            <div className="flex flex-col items-center text-center md:flex-1">
              <div className="text-5xl font-bold md:text-6xl">
                <span className="bg-tabiya-green/30 px-2 text-oxford-blue">3,074</span>
              </div>
              <div className="mt-2 text-lg font-medium uppercase tracking-wider text-green-3">Occupations</div>
            </div>

            {/* Divider */}
            <div className="hidden h-20 w-px bg-green-3/30 md:block" />

            {/* Skills */}
            <div className="flex flex-col items-center text-center md:flex-1">
              <div className="text-5xl font-bold md:text-6xl">
                <span className="bg-tabiya-green/30 px-2 text-oxford-blue">13,894</span>
              </div>
              <div className="mt-2 text-lg font-medium uppercase tracking-wider text-green-3">Skills</div>
            </div>

            {/* Divider */}
            <div className="hidden h-20 w-px bg-green-3/30 md:block" />

            {/* Occ-Skill Relations */}
            <div className="flex flex-col items-center text-center md:flex-1">
              <div className="text-5xl font-bold md:text-6xl">
                <span className="bg-tabiya-green/30 px-2 text-oxford-blue">130,567</span>
              </div>
              <div className="mt-2 text-lg font-medium uppercase tracking-wider text-green-3">Occ-Skill Relations</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards - Figma style with absolute positioned images */}
      <section className="bg-soft-green py-16 md:py-24">
        <div className="container-app">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Card 1: Skills-first Taxonomy */}
            <article className="relative h-[500px] md:h-[593px] overflow-hidden rounded-2xl bg-tabiya-gray">
              <div className="p-6 md:p-8">
                <h3 className="mb-2 text-lg md:text-xl font-semibold text-oxford-blue tracking-tight">
                  Skills-first Taxonomy
                </h3>
                <p className="text-base md:text-lg font-medium leading-relaxed text-green-3">
                  Traditional taxonomies start with job titles. We start with skills.
                  By mapping the competencies people actually develop, whether through
                  formal employment, self-employment, or unpaid work, we create pathways
                  that recognize what people can do, not just what they've been paid to do.
                </p>
              </div>
              {/* Absolute positioned image */}
              <div className="absolute bottom-[-53px] left-1/2 -translate-x-1/2 w-[218px] md:w-[269px] h-[212px] md:h-[316px]">
                <img
                  src="/assets/images/about-skills-first.jpeg"
                  alt="Skills-first taxonomy"
                  className="absolute inset-0 w-full h-full object-cover rounded-[32px]"
                />
                <div className="absolute inset-0 rounded-[32px] border-8 border-soft-green shadow-lg" />
              </div>
            </article>

            {/* Card 2: Inclusive of All Economic Activity */}
            <article className="relative h-[500px] md:h-[593px] overflow-hidden rounded-2xl bg-tabiya-gray">
              <div className="p-6 md:p-8">
                <h3 className="mb-2 text-lg md:text-xl font-semibold text-oxford-blue tracking-tight">
                  Inclusive of All Economic Activity
                </h3>
                <p className="text-base md:text-lg font-medium leading-relaxed text-green-3">
                  Most labor market frameworks only capture paid, formal work.
                  We've expanded the map to include the "unseen economy":
                  caregiving, household management, volunteer work, and informal
                  livelihoods that build real, transferable skills.{' '}
                  <Link to={`/${lang}/explore?filter=unseen`} className="inline bg-tabiya-green px-1 text-oxford-blue font-semibold transition-colors hover:bg-oxford-blue hover:text-white">
                    Explore Tabiya's Unseen Economy occupations and skills →
                  </Link>
                </p>
              </div>
              {/* Absolute positioned image */}
              <div className="absolute bottom-[-35px] left-1/2 -translate-x-1/2 w-[218px] md:w-[269px] h-[212px] md:h-[251px]">
                <img
                  src="/assets/images/about-inclusive.jpeg"
                  alt="Inclusive economy"
                  className="absolute inset-0 w-full h-full object-cover rounded-[32px]"
                />
                <div className="absolute inset-0 rounded-[32px] border-8 border-soft-green shadow-lg" />
              </div>
            </article>

            {/* Card 3: Localizable to Any Context */}
            <article className="relative h-[500px] md:h-[593px] overflow-hidden rounded-2xl bg-tabiya-gray">
              <div className="p-6 md:p-8">
                <h3 className="mb-2 text-lg md:text-xl font-semibold text-oxford-blue tracking-tight">
                  Localizable to Any Context
                </h3>
                <p className="text-base md:text-lg font-medium leading-relaxed text-green-3">
                  Labor markets differ. A useful taxonomy must adapt. Our open
                  platform lets partners create localized versions that reflect
                  regional job titles, local languages, and context-specific
                  skills—while maintaining compatibility with global standards.{' '}
                  <Link to={`/${lang}/explore?locale=za`} className="inline bg-tabiya-green px-1 text-oxford-blue font-semibold transition-colors hover:bg-oxford-blue hover:text-white">
                    Explore the localized taxonomy developed for South Africa →
                  </Link>
                </p>
              </div>
              {/* Absolute positioned image */}
              <div className="absolute bottom-[-11px] left-1/2 -translate-x-1/2 w-[180px] md:w-[240px] h-[180px] md:h-[200px]">
                <img
                  src="/assets/images/about-localizable.png"
                  alt="Localizable taxonomy"
                  className="absolute inset-0 w-full h-full object-cover rounded-[32px]"
                />
                <div className="absolute inset-[-4px] rounded-[36px] border-8 border-soft-green shadow-lg" />
              </div>
            </article>
          </div>
        </div>
      </section>

    </div>
  );
}
