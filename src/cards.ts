// Store original card files locally without localStorage size limits.
function database(): Promise<IDBDatabase> {
 return new Promise((resolve,reject)=>{
  const request=indexedDB.open('halloween-prize-cards',1);
  request.onupgradeneeded=()=>request.result.createObjectStore('cards');
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error);
 });
}
export async function loadCards():Promise<Record<string,Blob>> {
 const db=await database();
 try{return await new Promise((resolve,reject)=>{
  const result:Record<string,Blob>={};const tx=db.transaction('cards','readonly');
  const request=tx.objectStore('cards').openCursor();
  request.onsuccess=()=>{const cursor=request.result;if(cursor){result[String(cursor.key)]=cursor.value;cursor.continue()}};
  tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);
 })}finally{db.close()}
}
export async function saveCard(id:string,file:File):Promise<void>{
 const db=await database();
 try{await new Promise<void>((resolve,reject)=>{
  const tx=db.transaction('cards','readwrite');tx.objectStore('cards').put(file,id);
  tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
 })}finally{db.close()}
}
