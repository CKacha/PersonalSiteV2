export type Project = {
    name: string;
    subtitle?: string;
    description?: string; // may contain HTML for inline links
    langs?: string[];
    image?: string;
    source?: string;
    visit?: string;
};

export const projects: Project[] = [
    {
        name: 'Hack Club: The Game',
        subtitle: 'Event Platform',
        description: 'Built a full-stack web platform using Ruby on Rails and React, allowing teenage hackers to build and submit projects to earn qualification to come to our in-person event in NYC!',
        langs: ['Ruby', 'React'],
        image: '/images/HCTG.png',
        source: 'https://github.com/hackclub/the-game',
        visit: 'https://game.hackclub.com/',
    },
    {
        name: 'Hack Club: The Game',
        subtitle: 'Game Platform',
        description: 'Built a full-stack Ruby on Rails web app featuring team/zone challenge mechanics, real-time map tracking through airtags among other things!',
        langs: ['Ruby'],
        image: '/images/HCTGP.png',
        source: 'https://github.com/hackclub/theplatform',
        visit: 'https://platform.game.hackclub.com/',
    },
    {
        name: 'Waffles',
        description: 'A Hack Club program where students learn how to use Javascript! After making and submitting their projects, they can get free waffles :p',
        image: '/images/waffles.png',
        source: 'https://github.com/hackclub/waffles',
        visit: 'https://waffles.hackclub.com/',
    },
    {
        name: 'Robby-Fischer',
        description: 'Created a robot arm capable of playing chess through an AI model trained by us on Hugging Face at an AMD sponsored hackathon called prototype!',
        langs: ['Python'],
        image: '/images/prototype.png',
        source: 'https://github.com/CKacha/Robby-Fischer',
        visit: 'https://github.com/CKacha/Robby-Fischer/blob/main/README.md',
    },
    {
        name: 'Sussy Wussy',
        description: 'A small Among Us-inspired game about aliens and residents fighting to launch nuclear bombs at each other. Made at <a href="https://nexus.hackclub.com/" target="_blank" rel="noreferrer">Hack Club Nexus</a>!',
        image: '/images/nexus.png',
        source: 'https://github.com/CKacha/horizons-smtjh',
        visit: 'https://github.com/CKacha/horizons-smtjh/blob/main/README.md',
    },
    {
        name: 'Grief Game',
        description: 'My team\'s submission for <a href="https://counterspell.hackclub.com/" target="_blank" rel="noreferrer">Counterspell</a>, a short game about finding yourself.',
        source: 'https://github.com/CKacha/griefgame',
        visit: 'https://github.com/CKacha/griefgame/blob/main/README.md',
    },
];
