import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}}), errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5173');
 await page.getByRole('button',{name:'Continuar',exact:true}).click();
 const homes=page.getByLabel('Viviendas',{exact:true});
 await homes.fill('12');await homes.press('End');await homes.press('Backspace');await homes.press('2');
 assert.equal(await homes.inputValue(),'12'); // Keep focus across state updates.
 await homes.fill('8');
 await page.getByRole('button',{name:'Continuar',exact:true}).click();
 const vacancy=page.getByLabel('Vacancia e impagos estimados');await vacancy.fill('101');
 assert.equal(await page.getByRole('button',{name:'Continuar',exact:true}).isDisabled(),true);
 await vacancy.fill('5');
 for(let i=0;i<3;i++)await page.getByRole('button',{name:'Continuar',exact:true}).click();
 await page.getByLabel('IRPF estimado de la aportación').fill('10000');
 assert.equal(await page.getByLabel('Total inicial · SL patrimonial').inputValue(),'13500');
 assert.equal(await page.getByLabel('Total inicial · SL con actividad').inputValue(),'13500');
 await page.getByRole('button',{name:'Ver mi comparación'}).click();await page.locator('#results').waitFor();
 assert.equal(await page.locator('.scenario').count(),3);
 const [download]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Descargar informe'}).click()]);
 assert.equal(download.suggestedFilename(),'arrenda-simulacion.txt');
 await page.getByRole('button',{name:'Guardar mi simulación'}).click();
 await page.reload();await page.getByRole('button',{name:'Recuperar simulación'}).click();
 assert.match(await page.getByRole('status').innerText(),/recuperado/);
 await page.getByRole('button',{name:'Guía de decisión',exact:true}).click();
 assert.equal(await page.locator('.research-topic').count(),18);
 await page.locator('.research-topic summary').first().click();
 await page.getByRole('button',{name:'Simulador',exact:true}).click();
 await page.setViewportSize({width:390,height:844});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.getByRole('button',{name:'Abrir menú'}).click();
 await page.getByRole('button',{name:'Fuentes y metodología'}).click();
 assert.equal(await page.locator('.source').count(),11);
 assert.deepEqual(errors,[]);
 console.log('OK: formulario, edición sin pérdida de foco, validación, aportación, 3 escenarios, descarga, persistencia, 18 temas, 11 fuentes y móvil sin desbordamiento.');
}finally{await browser.close();}
