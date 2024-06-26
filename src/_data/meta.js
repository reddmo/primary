module.exports = {
  url: process.env.URL || 'https://stuffandthings.lol',
  siteName: 'stuff&things',
  siteDescription:
    'some stuff & things',
  siteType: 'Person', // schema
  locale: 'en_EN',
  lang: 'en',
  skipContent: 'Skip to content',
  author: 'Jason Moser', // i.e. Lene Saile - page / blog author's name. Must be set.
  authorAvatar: '/assets/images/template/stuffandthings.png', // for h-card, defaults to favicon
  authorEmail: '', // i.e. hola@lenesaile.com - email of the author
  authorWebsite: '', // i.e. https.://www.lenesaile.com - the personal site of the author
  creator: 'Jason Moser', // i.e. Lene Saile - creator's (developer) name.
  creatorEmail: 'admin@reddmo.com', // i.e. hola@lenesaile.com
  creatorWebsite: 'https://stuffandthings.lol', // i.e. https.://www.lenesaile.com
  creatorSocial: 'https://social.lol/@jasonm', // i.e. https.://www.lenesaile.com
  themeColor: 'var(--text-color)', //  Manifest: defines the default theme color for the application
  themeBgColor: 'var(--bg-color)', // Manifest: defines a placeholder background color for the application page to display before its stylesheet is loaded
  meta_data: {
    opengraph_default: '/assets/images/template/stuffandthings.jpg', // fallback/default meta image
    opengraph_default_alt:
      'An image with the words Stuff & Things and tool icons' // alt text for default meta image
  },
  blog: {
    // this is for the rss feed
    name: 'stuff & things',
    description:
      'A hodge podge of stuff & things on various topics.',
    tagSingle: 'Tag',
    tagPlural: 'Tags',
    // feed links are looped over in the head.
    feedLinks: [{title: 'Atom Feed', url: '/feed.xml', type: 'application/atom+xml'}],
    pagination: 'Blog',
    paginationPage: 'Page',
    paginationPrevious: 'Previous',
    paginationNext: 'Next'
  },
  pagination: {
    itemsPerPage: 20
  },
  navigation: {
    ariaTop: 'Main',
    ariaBottom: 'Complementary',
    ariaSocial: 'Social',
    drawerNav: false,
    navLabel: 'Menu'
  },
  themeSwitch: {
    title: 'Theme',
    light: 'light',
    dark: 'dark',
    initial: 'select'
  },
  greenweb: {
    // this goues into src/common/greenweb.njk
    providers: {
      // if you want to add more than one, edit the array directly.
      domain: 'netlify.com',
      service: 'static-hosting'
    },
    credentials: {
      // optional, eg: 	{ domain='my-org.com', doctype = 'webpage', url = 'https://my-org.com/our-climate-record'}
      domain: '',
      doctype: '',
      url: ''
    }
  },
  easteregg: true
};