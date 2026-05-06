export const categoryColor = (category) => {
  const colors = {
    temple:           'deep-orange',
    fort:             'brown',
    cave:             'blue-grey',
    ghat:             'blue',
    ashram:           'green',
    gurudwara:        'amber',
    sacred_river:     'cyan',
    ancient_site:     'deep-purple',
    heritage_village: 'teal',
    museum:           'indigo',
    natural_sacred:   'light-green',
    other:            'grey'
  };
  return colors[category] || 'grey';
};

export const formatCategory = (category) => {
  return category.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

export const CATEGORIES = [
  { title: 'Temple', value: 'temple' },
  { title: 'Fort', value: 'fort' },
  { title: 'Cave', value: 'cave' },
  { title: 'Ghat', value: 'ghat' },
  { title: 'Ashram', value: 'ashram' },
  { title: 'Gurudwara', value: 'gurudwara' },
  { title: 'Sacred River', value: 'sacred_river' },
  { title: 'Ancient Site', value: 'ancient_site' },
  { title: 'Heritage Village', value: 'heritage_village' },
  { title: 'Museum', value: 'museum' },
  { title: 'Natural Sacred', value: 'natural_sacred' },
  { title: 'Other', value: 'other' }
];

export const categoryFallback = () => '';

export const categoryGradients = {
  temple:           'linear-gradient(135deg, #B45309 0%, #D97706 100%)',
  fort:             'linear-gradient(135deg, #78350F 0%, #92400E 100%)',
  cave:             'linear-gradient(135deg, #374151 0%, #6B7280 100%)',
  ghat:             'linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)',
  ashram:           'linear-gradient(135deg, #15803D 0%, #16A34A 100%)',
  gurudwara:        'linear-gradient(135deg, #92400E 0%, #F59E0B 100%)',
  sacred_river:     'linear-gradient(135deg, #0E7490 0%, #06B6D4 100%)',
  ancient_site:     'linear-gradient(135deg, #5B21B6 0%, #7C3AED 100%)',
  heritage_village: 'linear-gradient(135deg, #0F766E 0%, #0D9488 100%)',
  museum:           'linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 100%)',
  natural_sacred:   'linear-gradient(135deg, #14532D 0%, #15803D 100%)',
  other:            'linear-gradient(135deg, #57534E 0%, #78716C 100%)'
};

export const categoryIcons = {
  temple:           'mdi-temple-hindu',
  fort:             'mdi-castle',
  cave:             'mdi-tunnel',
  ghat:             'mdi-waves',
  ashram:           'mdi-meditation',
  gurudwara:        'mdi-star-david',
  sacred_river:     'mdi-wave',
  ancient_site:     'mdi-pillar',
  heritage_village: 'mdi-home-group',
  museum:           'mdi-bank',
  natural_sacred:   'mdi-tree',
  other:            'mdi-map-marker'
};