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