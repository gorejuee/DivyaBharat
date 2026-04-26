export const categoryColor = (category) => {
  const colors = {
    temple: 'orange',
    fort: 'brown',
    cave: 'grey',
    ghat: 'blue',
    ashram: 'green',
    gurudwara: 'yellow',
    sacred_river: 'cyan',
    ancient_site: 'purple',
    heritage_village: 'teal',
    museum: 'indigo',
    natural_sacred: 'light-green',
    other: 'default'
  };
  return colors[category] || 'default';
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