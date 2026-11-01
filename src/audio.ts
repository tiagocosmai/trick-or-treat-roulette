// Procedural audio: no downloads or external sound services.
export class HalloweenAudio {
 private ctx = new AudioContext();
 private master = this.ctx.createGain();
 private ambience: AudioNode[] = [];
 private sources: (OscillatorNode | AudioBufferSourceNode)[] = [];
 private clickBuffer: AudioBuffer;
 constructor() {
  this.master.gain.value = .65;
  this.master.connect(this.ctx.destination);
  this.clickBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * .035, this.ctx.sampleRate);
  const data = this.clickBuffer.getChannelData(0);
  for (let i=0;i<data.length;i++) data[i]=(Math.random()*2-1)*Math.exp(-i/(data.length*.16));
 }
 async enable() { await this.ctx.resume(); this.startAmbient(); }
 private startAmbient() {
  if(this.sources.length) return;
  const bed=this.ctx.createGain();bed.gain.value=.11;bed.connect(this.master);this.ambience.push(bed);
  // Detuned low drones and a slowly wavering high ghost voice.
  for (const [frequency,level] of [[55,.65],[55.4,.4],[82.41,.2],[220,.08],[233.08,.06]]) {
   const osc=this.ctx.createOscillator(),gain=this.ctx.createGain();osc.type='sine';osc.frequency.value=frequency;gain.gain.value=level;
   osc.connect(gain);gain.connect(bed);osc.start();this.sources.push(osc);this.ambience.push(gain);
   const lfo=this.ctx.createOscillator(),depth=this.ctx.createGain();lfo.frequency.value=.07+frequency/3000;depth.gain.value=frequency*.009;
   lfo.connect(depth);depth.connect(osc.frequency);lfo.start();this.sources.push(lfo);this.ambience.push(depth);
  }
  const wind=this.ctx.createBuffer(1,this.ctx.sampleRate*6,this.ctx.sampleRate);
  const samples=wind.getChannelData(0);for(let i=0;i<samples.length;i++)samples[i]=Math.random()*2-1;
  const source=this.ctx.createBufferSource(),filter=this.ctx.createBiquadFilter(),gain=this.ctx.createGain();
  source.buffer=wind;source.loop=true;filter.type='bandpass';filter.frequency.value=420;filter.Q.value=1.5;gain.gain.value=.055;
  source.connect(filter);filter.connect(gain);gain.connect(this.master);source.start();this.sources.push(source);this.ambience.push(filter,gain);
  const gust=this.ctx.createOscillator(),depth=this.ctx.createGain();gust.frequency.value=.09;depth.gain.value=270;gust.connect(depth);depth.connect(filter.frequency);gust.start();this.sources.push(gust);this.ambience.push(depth);
 }
 tick() {
  if(this.ctx.state!=='running') return;
  const source=this.ctx.createBufferSource(),filter=this.ctx.createBiquadFilter(),gain=this.ctx.createGain();
  source.buffer=this.clickBuffer;filter.type='highpass';filter.frequency.value=700;gain.gain.value=.5;
  source.connect(filter);filter.connect(gain);gain.connect(this.master);
  source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect()};source.start();
 }
 reveal() {
  const now=this.ctx.currentTime;
  for(const [index,freq] of [523.25,659.25,783.99].entries()){
   const osc=this.ctx.createOscillator(),gain=this.ctx.createGain();const start=now+index*.09;
   osc.type='sine';osc.frequency.value=freq;gain.gain.setValueAtTime(.001,start);gain.gain.exponentialRampToValueAtTime(.09,start+.015);gain.gain.exponentialRampToValueAtTime(.001,start+.6);
   osc.connect(gain);gain.connect(this.master);osc.onended=()=>{osc.disconnect();gain.disconnect()};osc.start(start);osc.stop(start+.65);
  }
 }
 async close() {
  this.sources.forEach(source=>{source.stop();source.disconnect()});this.ambience.forEach(node=>node.disconnect());this.sources=[];this.ambience=[];
  await this.ctx.close();
 }
}
// Same cubic-bezier(.16,.75,.12,1) as the wheel's CSS transition.
export function easedRotation(progress:number) {
 const curve=(t:number,a:number,b:number)=>3*(1-t)**2*t*a+3*(1-t)*t*t*b+t**3;
 let lo=0,hi=1;for(let i=0;i<20;i++){const mid=(lo+hi)/2;if(curve(mid,.16,.12)<progress)lo=mid;else hi=mid}
 return curve((lo+hi)/2,.75,1);
}
