export const candies = [
  { id: 'doces', name: 'Doces variados', icon: '🎃', color: '#e98632' },
  { id: 'pirulito', name: 'Pirulito', icon: '🍭', color: '#9453ce' },
  { id: 'balas', name: 'Balas', icon: '👻', color: '#528c72' },
  { id: 'moranguete', name: 'Moranguete', icon: '🍓', color: '#bd466e' },
  { id: 'dadinho', name: 'Dadinho', icon: '🦇', color: '#bd8c46' },
  { id: 'azeda', name: 'Bala azeda', icon: '🧪', color: '#7d9f3e' },
  { id: 'olho', name: 'Marshmallow de olho', icon: '👁️', color: '#6262b2' },
  { id: 'chiclete', name: 'Chiclete', icon: '🧛', color: '#ba5e99' },
  { id: 'chocolate', name: 'Chocolate', icon: '🍫', color: '#976049' },
  { id: 'minhoca', name: 'Minhoca de gelatina', icon: '🐛', color: '#699342' },
  { id: 'abobora', name: 'Abóbora de goma', icon: '🎃', color: '#d1742d' },
  { id: 'beijinho', name: 'Beijinho', icon: '💀', color: '#7b64a8' },
  { id: 'brigadeiro', name: 'Brigadeiro', icon: '🕷️', color: '#9e626e' },
  { id: 'dentadura', name: 'Dentadura de goma', icon: '🧛‍♀️', color: '#ac4862' },
  { id: 'pipoca', name: 'Pipoca doce', icon: '🍿', color: '#b28c42' },
  { id: 'jujuba', name: 'Jujuba', icon: '🔮', color: '#9259bc' },
];
export const products = [
 {id:'cpm',name:'CPM do Capeta',icon:'😈',spriteIndex:0,color:'#e97816'},
 {id:'ctr',name:'CTR do Terror',icon:'🖱️',spriteIndex:1,color:'#8b32c5'},
 {id:'roas',name:'ROAS Sobrenatural',icon:'📊',spriteIndex:2,color:'#30203f'},
 {id:'frequency',name:'Frequência 666',icon:'666',spriteIndex:3,color:'#d8791c'},
 {id:'always',name:'Always On',icon:'∞',spriteIndex:4,color:'#8a24c7'},
 {id:'attribution',name:'Atribuição Paranormal',icon:'👻',spriteIndex:5,color:'#392344'},
 {id:'reach',name:'Alcance do Além',icon:'👥',spriteIndex:6,color:'#e38c24'},
 {id:'optimization',name:'Otimização Infinita',icon:'⚙️',spriteIndex:7,color:'#682ba3'},
];
export function phaseAfterPrize(isExtraSpin, bonusEnabled) {
 return isExtraSpin || !bonusEnabled ? 'done' : 'bonus';
}
const bonusOptions = {
 again: {id:'again',name:'Mais um giro',icon:'🔄',color:'#6a479c', description:'Você mantém o primeiro doce e ganha um último giro na roleta de doces, sem nova coringa!'},
 swap: {id:'swap',name:'Troque seu doce',icon:'🍬',color:'#b66b36', description:'Troque o doce sorteado por um da sua preferência.'},
 stop: {id:'stop',name:'Fim dos giros',icon:'👻',color:'#4e7168', description:'Infelizmente, você não pode girar de novo. Aproveite seu doce!'},
 double: {id:'double',name:'Ganhe em dobro',icon:'✨',color:'#a17b30', description:'Sorte de outro mundo! Leve duas unidades do doce sorteado.'}
};
// Alternate outcomes around the entire circle, including the last/first boundary.
export const bonuses = ['again', 'swap', 'stop', 'double', 'swap', 'stop'].map(id => bonusOptions[id]);
export function targetRotation(previous, index, count) {
 const angle = 360 / count;
 const target = ((360 - (index + .5) * angle) % 360 + 360) % 360;
 return previous + 1800 + ((target - previous % 360 + 360) % 360);
}
