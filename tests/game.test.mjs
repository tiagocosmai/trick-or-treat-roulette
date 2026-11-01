import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { candies, products, bonuses, targetRotation, phaseAfterPrize, celebrationPrizes } from '../src/game.mjs';
test('catalog has 16 distinct candies with icons and colors',()=>{
 assert.equal(candies.length,16);assert.equal(new Set(candies.map(c=>c.id)).size,16);
 for(const item of candies){assert.ok(item.icon);assert.match(item.color,/^#[0-9a-f]{6}$/i)}
});
test('bonus wheel has six slices with requested weights and no equal neighbors',()=>{
 assert.equal(bonuses.length,6);
 for(const [id,count] of Object.entries({again:1,swap:2,stop:2,double:1})) {
  assert.equal(bonuses.filter(b=>b.id===id).length,count);
 }
 bonuses.forEach((item,index)=>assert.notEqual(item.id,bonuses[(index+1)%bonuses.length].id));
});
test('pointer lands at center of selected slice for every supported wheel size and repeated spin',()=>{
 for(let count=1;count<=16;count++){
 let previous=0;
 for(let round=0;round<3;round++)for(let index=0;index<count;index++){
 const rotation=targetRotation(previous,index,count);
 assert.ok(rotation-previous>=1800);
 const pointer=(360-rotation%360)%360;
 assert.ok(Math.abs(pointer-(index+.5)*360/count)<1e-8);
 previous=rotation;
 }
 }
});

test('products catalog matches only the eight supplied media outcomes',()=>{
 assert.deepEqual(products.map(p=>p.name),['CPM do Capeta','CTR do Terror','Alcance do Além','VTR de Arrepiar','Engajamento Sobrenatural','Conversão do Além','CPA de Arrepiar','ROAS Sobrenatural']);
 assert.equal(new Set(products.map(p=>p.id)).size,8);
 for(const item of products){assert.ok(item.icon);assert.match(item.color,/^#[0-9a-f]{6}$/i)}
});
test('bonus can be disabled and extra spins always finish without another bonus',()=>{
 assert.equal(phaseAfterPrize(false,true),'bonus');
 assert.equal(phaseAfterPrize(false,false),'done');
 assert.equal(phaseAfterPrize(true,true),'done');
 assert.equal(phaseAfterPrize(true,false),'done');
});

test('each numbered card maps to the correct prize',()=>{
 assert.deepEqual(products.map(p=>p.number),[1,2,3,4,5,6,7,8]);
 assert.deepEqual(products.map(p=>p.prize),[
  'Dadinho ou 7 Belo','Chiclete ou bala simples (temática de abóbora)',
  'Gomets Halloween (tubinho)','Fofs (marshmallow)',
  'Dipnlik ou Chaves (com tatuagem)','Docigoma (mini abóbora)',
  'Moranguete','Plutonita ou Azedinho de Morango'
 ]);
});
test('celebration shows the correct cards and quantity for normal, double and extra rounds',()=>{
 assert.deepEqual(celebrationPrizes(null,null),[]);
 assert.deepEqual(celebrationPrizes(null,products[0]),[{item:products[0],quantity:1}]);
 assert.deepEqual(celebrationPrizes(null,products[0],'again'),[{item:products[0],quantity:1}]);
 assert.deepEqual(celebrationPrizes(null,products[7],'double'),[{item:products[7],quantity:2}]);
 assert.deepEqual(celebrationPrizes(products[0],products[7]),[{item:products[0],quantity:1},{item:products[7],quantity:1}]);
 assert.deepEqual(celebrationPrizes(products[0],products[0]),[{item:products[0],quantity:1},{item:products[0],quantity:1}]);
});

test('all eight original cards exist as valid portrait PNGs',()=>{
 for(const product of products){
  const file=readFileSync(new URL(`../public/cards/${product.number}.png`,import.meta.url));
  assert.equal(file.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  assert.equal(file.readUInt32BE(16),372);
  assert.equal(file.readUInt32BE(20),500);
 }
});
