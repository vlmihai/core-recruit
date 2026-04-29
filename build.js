const fs = require('fs');
const path = require('path');

const folders = ['partners', 'testimonials', 'team'];

folders.forEach(folder => {
  const dir = path.join(__dirname, 'content', folder);
  if (!fs.existsSync(dir)) return;

  const slugs = fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace('.md', ''))
    .sort();

  const indexPath = path.join(dir, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(slugs, null, 2));
  console.log(`Generated ${folder}/index.json with ${slugs.length} entries:`, slugs);
});
