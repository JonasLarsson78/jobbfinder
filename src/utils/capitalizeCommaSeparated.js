export default (input) => {
  if (typeof input !== 'string') return '';

  return input
    .replace(/\s+/g, '')
    .split(',')
    .filter(Boolean)
    .map((s) => s[0].toUpperCase() + s.slice(1).toLowerCase())
    .join(',');
};
