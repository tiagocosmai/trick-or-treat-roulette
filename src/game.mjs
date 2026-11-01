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
 {id:'cpm',number:1,name:'CPM do Capeta',icon:'😈',spriteIndex:0,color:'#e97816',prize:'Dadinho ou 7 Belo',description:'Caro demais pra valer um prêmio. Pegue um docinho básico.'},
 {id:'ctr',number:2,name:'CTR do Terror',icon:'🖱️',spriteIndex:1,color:'#8b32c5',prize:'Chiclete ou bala simples (temática de abóbora)',description:'Clicou no susto! Prêmio de entrada.'},
 {id:'reach',number:3,name:'Alcance do Além',icon:'👥',spriteIndex:6,color:'#e38c24',prize:'Gomets Halloween (tubinho)',description:'Chegou até o além! Pegue um tubinho!'},
 {id:'vtr',number:4,name:'VTR de Arrepiar',icon:'👁️',color:'#7028aa',prize:'Fofs (marshmallow)',description:'Assistiram até o fim! Desbloqueou um doce diferente!'},
 {id:'engagement',number:5,name:'Engajamento Sobrenatural',icon:'💬',color:'#d8791c',prize:'Dipnlik ou Chaves (com tatuagem)',description:'A galera interagiu com tudo! Escolha seu prêmio.'},
 {id:'conversion',number:6,name:'Conversão do Além',icon:'🎯',color:'#7a28b4',prize:'Docigoma (mini abóbora)',description:'A conversão aconteceu! Pegue uma mini abóbora.'},
 {id:'cpa',number:7,name:'CPA de Arrepiar',icon:'🍓',color:'#e97816',prize:'Moranguete',description:'Aquisição eficiente merece um prêmio melhor!'},
 {id:'roas',number:8,name:'ROAS Sobrenatural',icon:'📊',spriteIndex:2,color:'#30203f',prize:'Plutonita ou Azedinho de Morango',description:'Retorno de outro mundo! Escolha um doce especial.'},
];
export function celebrationPrizes(firstPrize, currentPrize, bonusId) {
 if (!currentPrize) return [];
 if (firstPrize) return [{item:firstPrize,quantity:1},{item:currentPrize,quantity:1}];
 return [{item:currentPrize,quantity:bonusId==='double'?2:1}];
}
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
