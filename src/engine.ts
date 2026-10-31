export type Input = {
 territory: string; year: number; purpose: string; homes: number; shops: number; rental: string; housingShare: number;
 annualRent: number; vacancy: number; expenses: number; interest: number; depreciation: number; principal: number;
 staff: string; staffCost: number; adminCost: number; otherActiveAssets: number; turnover: number;
 edav: boolean; holdYears: number; separateAccounts: boolean; distribute: number; savingsBase: number;
 entryPatrimonial: number; entryActivity: number; horizon: number; specialExclusion: boolean;
};
export const defaults: Input = {territory:'comun',year:2026,purpose:'both',homes:8,shops:1,rental:'residential',housingShare:85,annualRent:108000,vacancy:5,expenses:18000,interest:9000,depreciation:22000,principal:12000,staff:'none',staffCost:30000,adminCost:2400,otherActiveAssets:0,turnover:108000,edav:true,holdYears:5,separateAccounts:true,distribute:50,savingsBase:0,entryPatrimonial:3500,entryActivity:3500,horizon:10,specialExclusion:false};
export function savingsTax(base: number): number {
 const limits=[6000,50000,200000,300000,Infinity], rates=[.19,.21,.23,.27,.30];
 let tax=0,prev=0; for(let i=0;i<limits.length;i++){tax+=Math.max(0,Math.min(base,limits[i])-prev)*rates[i];prev=limits[i];} return tax;
}
export function businessTax(base:number, turnover:number, specialExclusion=false):number {
 if(base<=0)return 0;
 if(specialExclusion)return base*.25;
 if(turnover<1_000_000)return Math.min(base,50000)*.19+Math.max(0,base-50000)*.21;
 if(turnover<10_000_000)return base*.23;
 return base*.25;
}
export function validate(i:Input):string[]{
 const errors:string[]=[];
 const enums: Partial<Record<keyof Input,string[]>>={purpose:['both','contribution','purchase'],rental:['residential','seasonal','tourist','mixed'],staff:['none','existing','review']};
 for(const [key,values] of Object.entries(enums))if(!values.includes(String(i[key as keyof Input])))errors.push('Revisa las opciones seleccionadas del cuestionario.');
 const nonnegative: (keyof Input)[]=['homes','shops','annualRent','expenses','interest','depreciation','principal','staffCost','adminCost','turnover','savingsBase','entryPatrimonial','entryActivity'];
 for(const k of nonnegative)if(typeof i[k]!=='number'||!Number.isFinite(i[k])||Number(i[k])<0)errors.push(`Revisa el campo ${k}: debe ser un número positivo o cero.`);
 for(const k of ['housingShare','vacancy','distribute','otherActiveAssets'] as const)if(!Number.isFinite(i[k])||i[k]<0||i[k]>100)errors.push(`El porcentaje ${k} debe estar entre 0 y 100.`);
 if(!Number.isInteger(i.homes)||!Number.isInteger(i.shops)||i.homes+i.shops<1)errors.push('Indica al menos un inmueble y utiliza cantidades enteras.');
 if(!Number.isFinite(i.horizon)||i.horizon<1||i.horizon>40)errors.push('El horizonte debe estar entre 1 y 40 años.');
 if(!Number.isFinite(i.holdYears)||i.holdYears<0)errors.push('Revisa los años de mantenimiento.');
 return errors;
}
export type Scenario={id:string;name:string;tax:number;base:number;dividendTax:number;staff:number;cash:number;personal:number;retained:number;total:number;entry:number;rate:string};
export function calculate(i: Input){
 const errors=validate(i);
 const supported=i.territory==='comun'&&i.year===2026;
 const rent=i.annualRent*(1-i.vacancy/100);
 const staff=i.staff==='existing'?0:i.staffCost;
 const eligibility=[
  {label:'Al menos 8 viviendas arrendadas u ofrecidas en todo momento',ok:i.homes>=8},
  {label:'Arrendamiento de vivienda habitual (LAU)',ok:i.rental==='residential'},
  {label:'Mantenimiento mínimo de 3 años por vivienda',ok:i.holdYears>=3},
  {label:'Contabilidad separada por inmueble',ok:i.separateAccounts},
  {label:'Al menos 55 % de rentas bonificables (ruta elegida)',ok:i.housingShare>=55},
 ];
 const edavEligible=eligibility.every(e=>e.ok);
 function scenario(id:string,name:string,active:boolean,edav=false):Scenario {
  const employment=active?staff:0;
  const base=rent-i.expenses-i.interest-i.depreciation-i.adminCost-employment;
  // EDAV: allocation is a simplifying assumption, not a legal allocation of expenses.
  const housingBase=Math.max(0,base)*i.housingShare/100;
  const tax=edav?Math.max(0,base)*.25-housingBase*.25*.40:active?businessTax(base,i.turnover,i.specialExclusion):Math.max(0,base)*.25;
  const cash=rent-i.expenses-i.interest-i.adminCost-employment-tax-i.principal;
  // Distribution limited by both estimated accounting profit and available annual cash.
  const dividend=Math.max(0,Math.min(cash,base-tax))*i.distribute/100;
  const dividendTax=savingsTax(i.savingsBase+dividend)-savingsTax(i.savingsBase);
  const personal=dividend-dividendTax,retained=cash-dividend;
  const entry=active?i.entryActivity:i.entryPatrimonial;
  return {id,name,tax,base,dividendTax,staff:employment,cash,personal,retained,total:(personal+retained)*i.horizon-entry,entry,rate:edav?'25 % · bonificación 40 % sobre cuota de vivienda':active?(i.specialExclusion?'25 %':i.turnover<1e6?'19 % / 21 %':i.turnover<1e7?'23 %':'25 %'):'25 %'};
 }
 const scenarios=[scenario('patrimonial','SL patrimonial',false),scenario('activity','SL con actividad económica',true)];
 if(i.edav&&edavEligible)scenarios.push(scenario('edav','Actividad + régimen de viviendas',true,true));
 const sorted=[...scenarios].sort((a,b)=>b.total-a.total);
 const comparable=supported&&errors.length===0;
 return {errors,supported,comparable,rent,eligibility,edavEligible,scenarios,best:sorted[0],difference:sorted[0].total-sorted[1].total,
  classificationUncertain:i.otherActiveAssets>50||i.staff==='review'||i.staff==='existing',staff,breakEven: sorted[0].id==='patrimonial'?null: (()=>{const gain=(sorted[0].total+sorted[0].entry-scenarios[0].total-scenarios[0].entry)/i.horizon;return gain>0?Math.max(0,(sorted[0].entry-scenarios[0].entry)/gain):null;})()};
}
