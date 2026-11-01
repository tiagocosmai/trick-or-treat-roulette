export interface Item { id: string; name: string; icon: string; color: string; description?: string; spriteIndex?: number; number?: number; prize?: string }
export const candies: Item[];
export const bonuses: Item[];
export function targetRotation(previous:number,index:number,count:number):number;

export const products: Item[];
export function phaseAfterPrize(isExtraSpin:boolean,bonusEnabled:boolean):'done'|'bonus';

export function celebrationPrizes(firstPrize:Item|null,currentPrize:Item|null,bonusId?:string):{item:Item;quantity:number}[];
