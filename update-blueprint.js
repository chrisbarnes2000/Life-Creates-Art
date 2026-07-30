const fs = require('fs');
const path = require('path');

const blueprintPath = path.join(__dirname, 'firebase-blueprint.json');
const blueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf8'));

if (!blueprint.entities.ShedDesign) {
  blueprint.entities.ShedDesign = {
    title: 'ShedDesign',
    type: 'object',
    properties: {
      id: { type: 'string' },
      style: { type: 'string' },
      size: { type: 'string' },
      siding: { type: 'string' },
      roof: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time' }
    }
  };
}

const structure = blueprint.firestore.structure;
if (!structure.find(s => s.path === '/customers/{userId}/shedDesigns/{designId}')) {
  structure.push({
    path: '/customers/{userId}/shedDesigns/{designId}',
    definition: {
      entityName: 'ShedDesign'
    }
  });
}

fs.writeFileSync(blueprintPath, JSON.stringify(blueprint, null, 2));
