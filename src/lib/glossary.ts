// Japanese Sword Terminology Glossary
// Terms are matched case-insensitively

export interface GlossaryEntry {
  term: string;
  reading?: string;  // Japanese reading in romaji
  kanji?: string;
  definition: string;
  category?: 'blade' | 'hamon' | 'hada' | 'sugata' | 'koshirae' | 'mei' | 'era' | 'general';
}

export const glossary: Record<string, GlossaryEntry> = {
  // Blade types
  'katana': {
    term: 'Katana',
    kanji: '刀',
    definition: 'A long sword with a curved, single-edged blade, worn edge-up in the belt. Standard blade length over 60cm.',
    category: 'blade',
  },
  'tachi': {
    term: 'Tachi',
    kanji: '太刀',
    definition: 'An older style of long sword, worn edge-down suspended from the belt. Typically has more curvature than katana.',
    category: 'blade',
  },
  'wakizashi': {
    term: 'Wakizashi',
    kanji: '脇差',
    definition: 'A short sword with blade length between 30-60cm, traditionally worn paired with a katana.',
    category: 'blade',
  },
  'tanto': {
    term: 'Tantō',
    kanji: '短刀',
    definition: 'A dagger or knife with blade length under 30cm.',
    category: 'blade',
  },
  'naginata': {
    term: 'Naginata',
    kanji: '薙刀',
    definition: 'A polearm with a curved blade, used by warriors and traditionally associated with women\'s martial arts.',
    category: 'blade',
  },
  'yari': {
    term: 'Yari',
    kanji: '槍',
    definition: 'A straight-bladed spear used by samurai.',
    category: 'blade',
  },

  // Hamon patterns
  'hamon': {
    term: 'Hamon',
    kanji: '刃文',
    definition: 'The temper line pattern visible along the edge of the blade, created during the differential hardening process.',
    category: 'hamon',
  },
  'suguha': {
    term: 'Suguha',
    kanji: '直刃',
    definition: 'A straight temper line running parallel to the edge. One of the oldest and most classic hamon patterns.',
    category: 'hamon',
  },
  'notare': {
    term: 'Notare',
    kanji: '湾れ',
    definition: 'A gently undulating, wave-like temper line pattern.',
    category: 'hamon',
  },
  'gunome': {
    term: 'Gunome',
    kanji: '互の目',
    definition: 'A regular pattern of repeated semicircular waves in the temper line.',
    category: 'hamon',
  },
  'choji': {
    term: 'Chōji',
    kanji: '丁子',
    definition: 'A clove-shaped pattern in the hamon, resembling clove flowers. Characteristic of Bizen tradition.',
    category: 'hamon',
  },
  'midare': {
    term: 'Midare',
    kanji: '乱れ',
    definition: 'An irregular, "disturbed" temper line pattern. General term for non-straight hamon.',
    category: 'hamon',
  },
  'hitatsura': {
    term: 'Hitatsura',
    kanji: '皆焼',
    definition: 'Full-temper pattern where the entire blade surface shows tempering activity.',
    category: 'hamon',
  },
  'nie': {
    term: 'Nie',
    kanji: '沸',
    definition: 'Coarse, visible martensite crystals in the hamon that appear as bright, sparkling particles.',
    category: 'hamon',
  },
  'nioi': {
    term: 'Nioi',
    kanji: '匂',
    definition: 'Fine martensite crystals forming a misty, cloud-like appearance in the hamon.',
    category: 'hamon',
  },
  'kinsuji': {
    term: 'Kinsuji',
    kanji: '金筋',
    definition: 'Bright lines of nie appearing like golden threads within the hamon or blade.',
    category: 'hamon',
  },
  'sunagashi': {
    term: 'Sunagashi',
    kanji: '砂流し',
    definition: 'Sweeping lines of nie resembling sand patterns left by receding waves.',
    category: 'hamon',
  },
  'ashi': {
    term: 'Ashi',
    kanji: '足',
    definition: 'Short lines of nioi extending from the hamon toward the edge, appearing like "legs".',
    category: 'hamon',
  },
  'yo': {
    term: 'Yō',
    kanji: '葉',
    definition: 'Leaf-shaped formations within the hamon.',
    category: 'hamon',
  },

  // Hada (grain) patterns
  'hada': {
    term: 'Hada',
    kanji: '肌',
    definition: 'The grain pattern visible on the blade surface, created by folding during forging.',
    category: 'hada',
  },
  'itame': {
    term: 'Itame',
    kanji: '板目',
    definition: 'Wood grain pattern, the most common type of hada.',
    category: 'hada',
  },
  'mokume': {
    term: 'Mokume',
    kanji: '杢目',
    definition: 'Burl wood grain pattern with circular or irregular swirling patterns.',
    category: 'hada',
  },
  'masame': {
    term: 'Masame',
    kanji: '柾目',
    definition: 'Straight grain pattern running parallel to the blade length.',
    category: 'hada',
  },
  'ayasugi': {
    term: 'Ayasugi',
    kanji: '綾杉',
    definition: 'A distinctive wavy pattern resembling cedar grain, characteristic of Gassan school.',
    category: 'hada',
  },
  'nashiji': {
    term: 'Nashiji',
    kanji: '梨子地',
    definition: 'Pear-skin texture, a very fine and tight grain pattern.',
    category: 'hada',
  },
  'ji-nie': {
    term: 'Ji-nie',
    kanji: '地沸',
    definition: 'Nie crystals appearing in the ji (blade surface) rather than just in the hamon.',
    category: 'hada',
  },
  'chikei': {
    term: 'Chikei',
    kanji: '地景',
    definition: 'Dark lines appearing in the ji, formed by concentrations of carbon.',
    category: 'hada',
  },

  // Blade shape terms
  'sugata': {
    term: 'Sugata',
    kanji: '姿',
    definition: 'The overall shape and form of the blade.',
    category: 'sugata',
  },
  'kissaki': {
    term: 'Kissaki',
    kanji: '切先',
    definition: 'The point section of the blade.',
    category: 'sugata',
  },
  'nakago': {
    term: 'Nakago',
    kanji: '茎',
    definition: 'The tang of the blade that fits into the handle.',
    category: 'sugata',
  },
  'nagasa': {
    term: 'Nagasa',
    kanji: '長さ',
    definition: 'The cutting edge length of the blade, measured in a straight line.',
    category: 'sugata',
  },
  'sori': {
    term: 'Sori',
    kanji: '反り',
    definition: 'The curvature of the blade, measured as the deepest point of the curve.',
    category: 'sugata',
  },
  'mihaba': {
    term: 'Mihaba',
    kanji: '身幅',
    definition: 'The width of the blade.',
    category: 'sugata',
  },
  'motohaba': {
    term: 'Motohaba',
    kanji: '元幅',
    definition: 'The width of the blade at the base (machi).',
    category: 'sugata',
  },
  'sakihaba': {
    term: 'Sakihaba',
    kanji: '先幅',
    definition: 'The width of the blade near the point.',
    category: 'sugata',
  },
  'kasane': {
    term: 'Kasane',
    kanji: '重ね',
    definition: 'The thickness of the blade at the back (mune).',
    category: 'sugata',
  },
  'shinogi': {
    term: 'Shinogi',
    kanji: '鎬',
    definition: 'The ridge line running along the blade that divides the flat and beveled surfaces.',
    category: 'sugata',
  },
  'mune': {
    term: 'Mune',
    kanji: '棟',
    definition: 'The back (spine) of the blade.',
    category: 'sugata',
  },
  'boshi': {
    term: 'Bōshi',
    kanji: '帽子',
    definition: 'The temper pattern in the kissaki (point) area.',
    category: 'sugata',
  },
  'yokote': {
    term: 'Yokote',
    kanji: '横手',
    definition: 'The line separating the kissaki from the main blade body.',
    category: 'sugata',
  },
  'fukura': {
    term: 'Fukura',
    kanji: '膨ら',
    definition: 'The curve of the cutting edge in the kissaki area.',
    category: 'sugata',
  },
  'horimono': {
    term: 'Horimono',
    kanji: '彫物',
    definition: 'Carvings or engravings on the blade, often depicting religious or symbolic imagery.',
    category: 'sugata',
  },
  'hi': {
    term: 'Hi',
    kanji: '樋',
    definition: 'A groove carved into the blade, reducing weight and adding structural strength.',
    category: 'sugata',
  },
  'bo-hi': {
    term: 'Bō-hi',
    kanji: '棒樋',
    definition: 'A single, wide groove running along the blade.',
    category: 'sugata',
  },

  // Mei and signature terms
  'mei': {
    term: 'Mei',
    kanji: '銘',
    definition: 'The signature inscribed on the tang of the blade.',
    category: 'mei',
  },
  'mumei': {
    term: 'Mumei',
    kanji: '無銘',
    definition: 'Unsigned; a blade without a signature.',
    category: 'mei',
  },
  'gimei': {
    term: 'Gimei',
    kanji: '偽銘',
    definition: 'A false or forged signature.',
    category: 'mei',
  },
  'orikaeshi-mei': {
    term: 'Orikaeshi-mei',
    kanji: '折返銘',
    definition: 'A signature preserved when a blade is shortened by folding the tang.',
    category: 'mei',
  },
  'kinzogan-mei': {
    term: 'Kinzōgan-mei',
    kanji: '金象嵌銘',
    definition: 'Gold-inlaid attribution added by a sword appraiser.',
    category: 'mei',
  },
  'omote': {
    term: 'Omote',
    kanji: '表',
    definition: 'The front/outer side of the blade (facing outward when worn).',
    category: 'mei',
  },
  'ura': {
    term: 'Ura',
    kanji: '裏',
    definition: 'The back/inner side of the blade (facing the body when worn).',
    category: 'mei',
  },

  // Traditions and schools
  'gokaden': {
    term: 'Gokaden',
    kanji: '五箇伝',
    definition: 'The Five Traditions: the five main sword-making traditions of Japan (Yamashiro, Yamato, Bizen, Soshu, Mino).',
    category: 'general',
  },
  'yamashiro': {
    term: 'Yamashiro',
    kanji: '山城',
    definition: 'One of the Five Traditions, centered in Kyoto. Known for elegant, refined works.',
    category: 'general',
  },
  'yamato': {
    term: 'Yamato',
    kanji: '大和',
    definition: 'One of the Five Traditions, centered in Nara. Associated with temple smiths.',
    category: 'general',
  },
  'bizen': {
    term: 'Bizen',
    kanji: '備前',
    definition: 'One of the Five Traditions, from Okayama. The largest sword-producing region, known for chōji hamon.',
    category: 'general',
  },
  'soshu': {
    term: 'Sōshū',
    kanji: '相州',
    definition: 'One of the Five Traditions, from Sagami. Known for dramatic nie-based works and hitatsura.',
    category: 'general',
  },
  'mino': {
    term: 'Mino',
    kanji: '美濃',
    definition: 'One of the Five Traditions, from Gifu. Known for practical, sharp blades.',
    category: 'general',
  },

  // Era terms
  'koto': {
    term: 'Kotō',
    kanji: '古刀',
    definition: 'Old swords made before 1596 (Keichō era).',
    category: 'era',
  },
  'shinto': {
    term: 'Shintō',
    kanji: '新刀',
    definition: 'New swords made from 1596 to approximately 1781.',
    category: 'era',
  },
  'shinshinto': {
    term: 'Shinshintō',
    kanji: '新々刀',
    definition: 'New-new swords made from approximately 1781 to 1876.',
    category: 'era',
  },
  'gendaito': {
    term: 'Gendaitō',
    kanji: '現代刀',
    definition: 'Modern swords made from 1876 to present.',
    category: 'era',
  },
  'heian': {
    term: 'Heian',
    kanji: '平安',
    definition: 'The Heian period (794-1185), when Japanese sword-making traditions began to develop.',
    category: 'era',
  },
  'kamakura': {
    term: 'Kamakura',
    kanji: '鎌倉',
    definition: 'The Kamakura period (1185-1333), considered the golden age of Japanese sword-making.',
    category: 'era',
  },
  'muromachi': {
    term: 'Muromachi',
    kanji: '室町',
    definition: 'The Muromachi period (1336-1573), marked by mass production and changing styles.',
    category: 'era',
  },

  // Koshirae terms
  'koshirae': {
    term: 'Koshirae',
    kanji: '拵',
    definition: 'The complete mounting of a sword, including all fittings.',
    category: 'koshirae',
  },
  'tsuba': {
    term: 'Tsuba',
    kanji: '鍔',
    definition: 'The sword guard, a disc-shaped fitting between blade and handle.',
    category: 'koshirae',
  },
  'fuchi': {
    term: 'Fuchi',
    kanji: '縁',
    definition: 'The collar fitting at the base of the handle.',
    category: 'koshirae',
  },
  'kashira': {
    term: 'Kashira',
    kanji: '頭',
    definition: 'The pommel cap at the end of the handle.',
    category: 'koshirae',
  },
  'menuki': {
    term: 'Menuki',
    kanji: '目貫',
    definition: 'Ornamental grip decorations placed under the handle wrapping.',
    category: 'koshirae',
  },
  'kozuka': {
    term: 'Kozuka',
    kanji: '小柄',
    definition: 'A small utility knife carried in a pocket of the scabbard.',
    category: 'koshirae',
  },
  'kogai': {
    term: 'Kōgai',
    kanji: '笄',
    definition: 'A skewer-like implement carried in the scabbard, used for hair arrangement.',
    category: 'koshirae',
  },
  'saya': {
    term: 'Saya',
    kanji: '鞘',
    definition: 'The scabbard of the sword.',
    category: 'koshirae',
  },
  'tsuka': {
    term: 'Tsuka',
    kanji: '柄',
    definition: 'The handle of the sword.',
    category: 'koshirae',
  },
  'habaki': {
    term: 'Habaki',
    kanji: '鎺',
    definition: 'The blade collar that wedges the sword securely in the scabbard.',
    category: 'koshirae',
  },
  'seppa': {
    term: 'Seppa',
    kanji: '切羽',
    definition: 'Thin washers placed on either side of the tsuba.',
    category: 'koshirae',
  },
  'same': {
    term: 'Same',
    kanji: '鮫',
    definition: 'Ray skin used to wrap the handle core, providing grip for the ito wrapping.',
    category: 'koshirae',
  },
  'ito': {
    term: 'Ito',
    kanji: '糸',
    definition: 'The cord wrapping on the handle, typically silk or cotton.',
    category: 'koshirae',
  },
  'tosogu': {
    term: 'Tōsōgu',
    kanji: '刀装具',
    definition: 'Collective term for all sword fittings and mountings.',
    category: 'koshirae',
  },

  // Appraisal terms
  'juyo': {
    term: 'Jūyō',
    kanji: '重要',
    definition: 'Important designation by the NBTHK for swords of high quality and historical significance.',
    category: 'general',
  },
  'tokubetsu-juyo': {
    term: 'Tokubetsu Jūyō',
    kanji: '特別重要',
    definition: 'Especially Important designation, the highest NBTHK ranking for exceptional swords.',
    category: 'general',
  },
  'nbthk': {
    term: 'NBTHK',
    definition: 'Nihon Bijutsu Token Hozon Kyokai - The Society for the Preservation of Japanese Art Swords.',
    category: 'general',
  },
  'origami': {
    term: 'Origami',
    kanji: '折紙',
    definition: 'A certificate of authenticity or appraisal for a sword.',
    category: 'general',
  },
  'sayagaki': {
    term: 'Sayagaki',
    kanji: '鞘書',
    definition: 'Inscription written on a storage scabbard, often by a noted expert.',
    category: 'general',
  },
  'oshigata': {
    term: 'Oshigata',
    kanji: '押形',
    definition: 'A traced rubbing of a blade, capturing details of the hamon, hada, and other features.',
    category: 'general',
  },
  'setsumei': {
    term: 'Setsumei',
    kanji: '説明',
    definition: 'Written description and analysis of a sword.',
    category: 'general',
  },
  'kantei': {
    term: 'Kantei',
    kanji: '鑑定',
    definition: 'The art and practice of sword appraisal and attribution.',
    category: 'general',
  },
  'denrai': {
    term: 'Denrai',
    kanji: '伝来',
    definition: 'Provenance; the history of ownership and transmission of a sword.',
    category: 'general',
  },
};

// Function to find a term in the glossary (case-insensitive)
export function findTerm(term: string): GlossaryEntry | undefined {
  const normalized = term.toLowerCase().replace(/[ōōūū]/g, (c) => {
    const map: Record<string, string> = { 'ō': 'o', 'ū': 'u' };
    return map[c] || c;
  });

  return glossary[normalized] || glossary[term.toLowerCase()];
}

// Get all terms for a category
export function getTermsByCategory(category: GlossaryEntry['category']): GlossaryEntry[] {
  return Object.values(glossary).filter(entry => entry.category === category);
}
