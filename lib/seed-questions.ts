import type { Card } from '@/types';

// The full curated question bank — seeded into the DB on first run
export const SEED_QUESTIONS: Array<Omit<Card, 'id'> & { id: string }> = [
  // ==================== RELATIONSHIP ====================
  // Tone: Playful - Truth
  { id: 'rel_playful_t1', type: 'truth', category: 'relationship', tone: 'playful', text: 'What was your very first impression of me, and how has it changed?', source: 'seed' },
  { id: 'rel_playful_t2', type: 'truth', category: 'relationship', tone: 'playful', text: 'If we were characters in a cartoon or sitcom, who would we be?', source: 'seed' },
  { id: 'rel_playful_t3', type: 'truth', category: 'relationship', tone: 'playful', text: 'What is the most ridiculous habit I have that you actually find endearing?', source: 'seed' },
  { id: 'rel_playful_t4', type: 'truth', category: 'relationship', tone: 'playful', text: 'What is a silly nickname you secretly want to call me but haven\'t?', source: 'seed' },
  { id: 'rel_playful_t5', type: 'truth', category: 'relationship', tone: 'playful', text: 'If you had to describe our relationship in three emojis, what would they be?', source: 'seed' },
  // Tone: Playful - Dare
  { id: 'rel_playful_d1', type: 'dare', category: 'relationship', tone: 'playful', text: 'Imitate my signature laugh or facial expression right now.', source: 'seed' },
  { id: 'rel_playful_d2', type: 'dare', category: 'relationship', tone: 'playful', text: 'Give me a 10-second dramatic declaration of love using a Shakespearean accent.', source: 'seed' },
  { id: 'rel_playful_d3', type: 'dare', category: 'relationship', tone: 'playful', text: 'Let me style your hair in any funny way I want and keep it like that for the next round.', source: 'seed' },
  { id: 'rel_playful_d4', type: 'dare', category: 'relationship', tone: 'playful', text: 'Stare into my eyes for 30 seconds without laughing or speaking. First to laugh loses.', source: 'seed' },
  { id: 'rel_playful_d5', type: 'dare', category: 'relationship', tone: 'playful', text: 'Feed me a bite of food or a sip of a drink as if we are at a fancy restaurant.', source: 'seed' },

  // Tone: Deep - Truth
  { id: 'rel_deep_t1', type: 'truth', category: 'relationship', tone: 'deep', text: 'What is one fear you have about our relationship that you\'ve never voiced out loud?', source: 'seed' },
  { id: 'rel_deep_t2', type: 'truth', category: 'relationship', tone: 'deep', text: 'What does love mean to you, and do you think you show it in the way I need?', source: 'seed' },
  { id: 'rel_deep_t3', type: 'truth', category: 'relationship', tone: 'deep', text: 'What is the biggest lesson you\'ve learned from a past relationship that you\'ve applied to ours?', source: 'seed' },
  { id: 'rel_deep_t4', type: 'truth', category: 'relationship', tone: 'deep', text: 'Is there something I do that makes you feel truly seen and understood?', source: 'seed' },
  { id: 'rel_deep_t5', type: 'truth', category: 'relationship', tone: 'deep', text: 'What is a dream or goal you haven\'t told me about yet?', source: 'seed' },
  // Deep - Dare
  { id: 'rel_deep_d1', type: 'dare', category: 'relationship', tone: 'deep', text: 'Write a genuine three-sentence love note to me right now and read it aloud.', source: 'seed' },
  { id: 'rel_deep_d2', type: 'dare', category: 'relationship', tone: 'deep', text: 'Tell me one thing you admire about me that you\'ve never said before.', source: 'seed' },
  { id: 'rel_deep_d3', type: 'dare', category: 'relationship', tone: 'deep', text: 'Share a memory of us that you never want to forget and explain why.', source: 'seed' },

  // Tone: Spicy - Truth
  { id: 'rel_spicy_t1', type: 'truth', category: 'relationship', tone: 'spicy', text: 'What was the exact moment you knew you were attracted to me?', source: 'seed' },
  { id: 'rel_spicy_t2', type: 'truth', category: 'relationship', tone: 'spicy', text: 'What is something romantic you\'ve always wanted to do but felt too shy to suggest?', source: 'seed' },
  { id: 'rel_spicy_t3', type: 'truth', category: 'relationship', tone: 'spicy', text: 'Name one surprising thing about me that you find really attractive.', source: 'seed' },
  // Spicy - Dare
  { id: 'rel_spicy_d1', type: 'dare', category: 'relationship', tone: 'spicy', text: 'Give me a long, meaningful hug for at least 20 seconds without saying a word.', source: 'seed' },
  { id: 'rel_spicy_d2', type: 'dare', category: 'relationship', tone: 'spicy', text: 'Slow dance with me to whatever music is playing for 60 seconds, no matter what.', source: 'seed' },

  // ==================== FRIENDS ====================
  { id: 'fri_funny_t1', type: 'truth', category: 'friends', tone: 'funny', text: 'What\'s the most embarrassing thing that has ever happened to you in public?', source: 'seed' },
  { id: 'fri_funny_t2', type: 'truth', category: 'friends', tone: 'funny', text: 'Have you ever blamed a fart on someone else in this group?', source: 'seed' },
  { id: 'fri_funny_t3', type: 'truth', category: 'friends', tone: 'funny', text: 'What was the last lie you told and who did you tell it to?', source: 'seed' },
  { id: 'fri_funny_t4', type: 'truth', category: 'friends', tone: 'funny', text: 'What is the most ridiculous thing you have cried about?', source: 'seed' },
  { id: 'fri_funny_d1', type: 'dare', category: 'friends', tone: 'funny', text: 'Let the person to your left post something on your social media story.', source: 'seed' },
  { id: 'fri_funny_d2', type: 'dare', category: 'friends', tone: 'funny', text: 'Do your best impression of someone in this group right now, no hints.', source: 'seed' },
  { id: 'fri_funny_d3', type: 'dare', category: 'friends', tone: 'funny', text: 'Call someone in your contacts and sing "Happy Birthday" even if it\'s not their birthday.', source: 'seed' },
  { id: 'fri_funny_d4', type: 'dare', category: 'friends', tone: 'funny', text: 'Speak in a foreign accent for the next 3 rounds. If you break it, you owe the group 10 push-ups.', source: 'seed' },

  { id: 'fri_deep_t1', type: 'truth', category: 'friends', tone: 'deep', text: 'What is one thing you\'ve always wanted to tell this group but felt too scared to say?', source: 'seed' },
  { id: 'fri_deep_t2', type: 'truth', category: 'friends', tone: 'deep', text: 'Who in this group has had the biggest positive impact on your life, and how?', source: 'seed' },
  { id: 'fri_deep_t3', type: 'truth', category: 'friends', tone: 'deep', text: 'What would you do differently if you knew you couldn\'t fail?', source: 'seed' },
  { id: 'fri_deep_d1', type: 'dare', category: 'friends', tone: 'deep', text: 'Give each person in the group a genuine, specific compliment.', source: 'seed' },
  { id: 'fri_deep_d2', type: 'dare', category: 'friends', tone: 'deep', text: 'Share something you\'ve been struggling with lately and let the group offer advice.', source: 'seed' },

  { id: 'fri_awk_t1', type: 'truth', category: 'friends', tone: 'awkward', text: 'Who in this group\'s dating history do you know the most embarrassing detail about?', source: 'seed' },
  { id: 'fri_awk_t2', type: 'truth', category: 'friends', tone: 'awkward', text: 'Have you ever had a crush on anyone in this room? Be honest.', source: 'seed' },
  { id: 'fri_awk_t3', type: 'truth', category: 'friends', tone: 'awkward', text: 'What is the most awkward moment you\'ve experienced with someone in this group?', source: 'seed' },
  { id: 'fri_awk_d1', type: 'dare', category: 'friends', tone: 'awkward', text: 'Rate everyone in the room from most to least likely to become a reality TV star.', source: 'seed' },
  { id: 'fri_awk_d2', type: 'dare', category: 'friends', tone: 'awkward', text: 'Text your most recent ex "Hey, was thinking about you" and show the screen to everyone.', source: 'seed' },

  // ==================== FAMILY ====================
  { id: 'fam_warm_t1', type: 'truth', category: 'family', tone: 'warm', text: 'What is a family tradition that you hope never goes away?', source: 'seed' },
  { id: 'fam_warm_t2', type: 'truth', category: 'family', tone: 'warm', text: 'What is the most valuable life lesson you have learned from someone in this family?', source: 'seed' },
  { id: 'fam_warm_t3', type: 'truth', category: 'family', tone: 'warm', text: 'What is one thing you appreciate about a family member that you\'ve never told them directly?', source: 'seed' },
  { id: 'fam_warm_d1', type: 'dare', category: 'family', tone: 'warm', text: 'Give the oldest person in the room a hug and tell them something you love about them.', source: 'seed' },
  { id: 'fam_warm_d2', type: 'dare', category: 'family', tone: 'warm', text: 'Share your happiest memory involving someone in this room.', source: 'seed' },

  { id: 'fam_nostalgic_t1', type: 'truth', category: 'family', tone: 'nostalgic', text: 'What is the funniest family vacation or trip memory you can recall?', source: 'seed' },
  { id: 'fam_nostalgic_t2', type: 'truth', category: 'family', tone: 'nostalgic', text: 'What\'s the first clear memory you have of this family being together?', source: 'seed' },
  { id: 'fam_nostalgic_t3', type: 'truth', category: 'family', tone: 'nostalgic', text: 'What childhood possession do you wish you still had?', source: 'seed' },
  { id: 'fam_nostalgic_d1', type: 'dare', category: 'family', tone: 'nostalgic', text: 'Do your best impression of a family member\'s signature phrase or habit.', source: 'seed' },
  { id: 'fam_nostalgic_d2', type: 'dare', category: 'family', tone: 'nostalgic', text: 'Share a photo from your phone that you have never shown anyone here.', source: 'seed' },

  // ==================== SEMINAR ====================
  { id: 'sem_prof_t1', type: 'truth', category: 'seminar', tone: 'professional', text: 'What is one professional skill you are secretly working to improve right now?', source: 'seed' },
  { id: 'sem_prof_t2', type: 'truth', category: 'seminar', tone: 'professional', text: 'What is the most valuable career advice you\'ve ever received?', source: 'seed' },
  { id: 'sem_prof_t3', type: 'truth', category: 'seminar', tone: 'professional', text: 'What did you want to be when you grew up, and how close is that to your current career?', source: 'seed' },
  { id: 'sem_prof_d1', type: 'dare', category: 'seminar', tone: 'professional', text: 'Pitch your current role or project in exactly 30 seconds as if you\'re presenting to investors.', source: 'seed' },
  { id: 'sem_prof_d2', type: 'dare', category: 'seminar', tone: 'professional', text: 'Share one professional goal you have for the next 12 months that you haven\'t told anyone.', source: 'seed' },

  { id: 'sem_creat_t1', type: 'truth', category: 'seminar', tone: 'creative', text: 'If you could redesign your job title to perfectly describe what you actually do, what would it be?', source: 'seed' },
  { id: 'sem_creat_t2', type: 'truth', category: 'seminar', tone: 'creative', text: 'What is the strangest or most creative idea you\'ve had at work that you were afraid to voice?', source: 'seed' },
  { id: 'sem_creat_d1', type: 'dare', category: 'seminar', tone: 'creative', text: 'Stand up and give a 20-second motivational speech to the group about absolutely anything.', source: 'seed' },
  { id: 'sem_creat_d2', type: 'dare', category: 'seminar', tone: 'creative', text: 'Create a 3-word slogan for our team or company and say it with dramatic enthusiasm.', source: 'seed' },
  { id: 'sem_creat_d3', type: 'dare', category: 'seminar', tone: 'creative', text: 'Stand up and strike a 5-second superhero pose. Strike it with pride.', source: 'seed' },
];

export const CATEGORIES = [
  { id: 'relationship', label: 'Relationship', description: 'For couples or romantic dates', tones: ['playful', 'deep', 'spicy'] },
  { id: 'friends', label: 'Friends', description: 'For parties, hangouts & dinners', tones: ['funny', 'deep', 'awkward'] },
  { id: 'family', label: 'Family', description: 'For family dinners and reunions', tones: ['warm', 'nostalgic'] },
  { id: 'seminar', label: 'Work & Seminar', description: 'For icebreakers and networking', tones: ['professional', 'creative'] },
  { id: 'custom', label: 'Custom Deck', description: 'Play with your own questions', tones: [] },
];

export const TONE_LABELS: Record<string, string> = {
  playful: '🎉 Playful',
  deep: '🧠 Deep Connection',
  spicy: '🌶️ Spicy',
  funny: '😂 Hilarious',
  awkward: '😬 Awkward Secrets',
  warm: '❤️ Warm & Loving',
  nostalgic: '📼 Nostalgic',
  professional: '💼 Professional',
  creative: '🎨 Creative Spark',
};

export const CATEGORY_ACCENT: Record<string, string> = {
  relationship: '#f43f5e',
  friends: '#a855f7',
  family: '#f59e0b',
  seminar: '#10b981',
  custom: '#0ea5e9',
};
