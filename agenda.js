const STORAGE_KEY='desafiosLocosAgendaV1';
const CONFIG_KEY='agendaShowConfigV1';
const CONFIG_DEFAULTS={
showName:'DESAFÍOS LOCOS',logoData:'',pdfBackgroundData:'',representative:'DANIEL LEON',whatsapp:'811 027 6858',
tiktok:'@desafiolocosmtv',facebook:'Desafios locos mtv',youtube:'@DESAFIOSLOCOS',instagram:'desafioslocosmtv',
includes:'1 HORA DE SHOW 100% DINÁMICO\nANIMACIÓN CÓMICA\nPREMIOS PARA CONCURSANTES\nDESAFÍOS Y CONCURSOS\nLLUVIA DE BURBUJAS\nPELOTAS GIGANTES\nCARNAVAL Y BANDERINES\nPARTICIPACIÓN EN EL PASTEL\nEQUIPO DE SONIDO',
clauses:'1. Cada contratación requiere de un anticipo para apartar fecha y horario del evento.\n2. En caso de que el artista no pueda presentarse, otro cubrirá su lugar siendo de la misma calidad.\n3. En caso de cancelar su evento, su anticipo no será devuelto.\n4. Firme si usted está de acuerdo.\n5. No se pueden entregar alimentos durante el show ni dulces, etc.\n6. Los inflables se tienen que apagar durante el show; no debe haber ninguna distracción durante el show.'
};
function leerConfig(){try{return {...CONFIG_DEFAULTS,...JSON.parse(localStorage.getItem(CONFIG_KEY)||'{}')}}catch{return {...CONFIG_DEFAULTS}}}
let config=leerConfig();
function guardarConfig(){localStorage.setItem(CONFIG_KEY,JSON.stringify(config))}
function actualizarLogotipo(){const logo=document.querySelector('#brandLogo'),marca=document.querySelector('#brandMark'),preview=document.querySelector('#logoPreview');if(config.logoData){logo.src=config.logoData;logo.hidden=false;marca.hidden=true;preview.src=config.logoData;preview.hidden=false}else{logo.hidden=true;logo.removeAttribute('src');marca.hidden=false;preview.hidden=true;preview.removeAttribute('src')}}
function prepararFormularioConfig(){const f=document.querySelector('#configForm');Object.keys(config).forEach(k=>{if(f.elements[k]&&f.elements[k].type!=='file')f.elements[k].value=config[k]??''});actualizarLogotipo();actualizarVistaFondo()}
const fondoInput=document.querySelector('#pdfBackgroundInput');
const fondoPreview=document.querySelector('#pdfBackgroundPreview');
function actualizarVistaFondo(){if(config.pdfBackgroundData){fondoPreview.src=config.pdfBackgroundData;fondoPreview.hidden=false}else{fondoPreview.hidden=true;fondoPreview.removeAttribute('src')}}
fondoInput.addEventListener('change',()=>{const archivo=fondoInput.files&&fondoInput.files[0];if(!archivo)return;if(!archivo.type.startsWith('image/')){alert('Selecciona una imagen válida.');fondoInput.value='';return}const lector=new FileReader();lector.onload=()=>{const imagen=new Image();imagen.onload=()=>{const escala=Math.min(1,1200/Math.max(imagen.width,imagen.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(imagen.width*escala));canvas.height=Math.max(1,Math.round(imagen.height*escala));const ctx=canvas.getContext('2d');ctx.drawImage(imagen,0,0,canvas.width,canvas.height);config.pdfBackgroundData=canvas.toDataURL('image/jpeg',0.92);try{guardarConfig();actualizarVistaFondo();document.querySelector('#configMsg').textContent='Fondo guardado. Aparecerá suavemente detrás del texto del contrato PDF.'}catch(err){config.pdfBackgroundData='';alert('La imagen es demasiado grande. Prueba con otra más pequeña.')}};imagen.onerror=()=>alert('No se pudo abrir esa imagen.');imagen.src=lector.result};lector.readAsDataURL(archivo)});
document.querySelector('#quitarFondoBtn').addEventListener('click',()=>{config.pdfBackgroundData='';fondoInput.value='';guardarConfig();actualizarVistaFondo();document.querySelector('#configMsg').textContent='Se quitó la imagen de fondo.'});
const logoInput=document.querySelector('#logoInput');
logoInput.addEventListener('change',()=>{const archivo=logoInput.files&&logoInput.files[0];if(!archivo)return;if(!archivo.type.startsWith('image/')){alert('Selecciona una imagen válida.');logoInput.value='';return}const lector=new FileReader();lector.onload=()=>{const imagen=new Image();imagen.onload=()=>{const escala=Math.min(1,600/Math.max(imagen.width,imagen.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(imagen.width*escala));canvas.height=Math.max(1,Math.round(imagen.height*escala));canvas.getContext('2d').drawImage(imagen,0,0,canvas.width,canvas.height);config.logoData=canvas.toDataURL('image/jpeg',0.86);try{guardarConfig();actualizarLogotipo();document.querySelector('#configMsg').textContent='Logotipo guardado. También aparecerá en el contrato PDF.'}catch(err){config.logoData='';alert('La imagen es demasiado grande para guardarla. Prueba con otra más pequeña.')}};imagen.onerror=()=>alert('No se pudo abrir esa imagen.');imagen.src=lector.result};lector.readAsDataURL(archivo)});
actualizarLogotipo()
document.querySelector('#quitarLogoBtn').addEventListener('click',()=>{config.logoData='';logoInput.value='';guardarConfig();actualizarLogotipo();document.querySelector('#configMsg').textContent='Se quitó la imagen del logotipo.'});
const configDialog=document.querySelector('#configDialog');
document.querySelector('#configurarContratoBtn').addEventListener('click',()=>{prepararFormularioConfig();document.querySelector('#configMsg').textContent='';configDialog.showModal()});
document.querySelector('#cerrarConfig').addEventListener('click',()=>configDialog.close());
document.querySelector('#configForm').addEventListener('submit',ev=>{ev.preventDefault();config={...CONFIG_DEFAULTS,...config,...Object.fromEntries(new FormData(ev.currentTarget).entries())};guardarConfig();actualizarLogotipo();document.querySelector('#configMsg').textContent='Tu contrato quedó guardado en este navegador.'});
document.querySelector('#restaurarConfig').addEventListener('click',()=>{if(!confirm('¿Restaurar los datos iniciales del contrato?'))return;config={...CONFIG_DEFAULTS};guardarConfig();logoInput.value='';prepararFormularioConfig();document.querySelector('#configMsg').textContent='Se restauraron los datos iniciales.'});



const form=document.querySelector('#eventoForm'), horaSelect=form.elements.hora, fechaInput=form.elements.fecha;
function actualizarResta(){const total=Number(form.elements.precio.value||0),anticipo=Number(form.elements.anticipo.value||0);form.elements.resta.value=(form.elements.precio.value||form.elements.anticipo.value)?Math.max(0,total-anticipo):''}
form.elements.precio.addEventListener('input',actualizarResta);
form.elements.anticipo.addEventListener('input',actualizarResta);

const dialog=document.querySelector('#detalleDialog');
let eventos=leerEventos(), seleccionado=null, editandoId=null;

const hoy=new Date();
fechaInput.min=fechaLocal(hoy);

function fechaLocal(d){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
return y+'-'+m+'-'+day}
function leerEventos(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]')}catch{return []}}
function guardar(){localStorage.setItem(STORAGE_KEY,JSON.stringify(eventos))}
function textoFecha(s){if(!s)return '';
return new Date(s+'T12:00:00').toLocaleDateString('es-MX',{day:'numeric',month:'long',year:'numeric'})}
function minutosHora(h){const [hh,mm]=String(h||'0:0').split(':').map(Number);return hh*60+mm}
function duracionMinutos(valor){if(valor==='1 hora y 30 minutos')return 90;if(valor==='2 horas')return 120;return 60}
function horaAMPM(h){const [hh,mm]=h.split(':').map(Number);const sufijo=hh<12?'AM':'PM';const hora=hh%12||12;return String(hora).padStart(2,'0')+':'+String(mm).padStart(2,'0')+' '+sufijo}
function seCruzan(inicioA,finA,inicioB,finB){return inicioA<finB&&inicioB<finA}
function llenarHorarios(){const fecha=fechaInput.value,hora=horaSelect.value;
if(!fecha||!hora){document.querySelector('#formMsg').textContent='';return}
const inicio=minutosHora(hora),fin=inicio+duracionMinutos(form.elements.duracion.value);
const ocupado=eventos.some(e=>{if(e.id===editandoId||e.fecha!==fecha)return false;const otroInicio=minutosHora(e.hora),otroFin=otroInicio+duracionMinutos(e.duracion);return seCruzan(inicio,fin,otroInicio,otroFin)});
document.querySelector('#formMsg').textContent=ocupado?'Ese horario se cruza con otra reservación. Elige otra hora.':''}
fechaInput.addEventListener('change',llenarHorarios);
horaSelect.addEventListener('change',llenarHorarios);
form.elements.duracion.addEventListener('change',llenarHorarios);
form.elements.fecha.value=fechaLocal(hoy);
llenarHorarios();

function actualizar(){document.querySelector('#totalEventos').textContent=eventos.length;
const mes=fechaLocal(hoy).slice(0,7);
document.querySelector('#eventosMes').textContent=eventos.filter(e=>e.fecha.startsWith(mes)).length;
const futuros=eventos.filter(e=>e.fecha>=fechaLocal(hoy)).sort(ordenar);
document.querySelector('#proximoEvento').textContent=futuros.length?new Date(futuros[0].fecha+'T12:00:00').toLocaleDateString('es-MX',{day:'numeric',month:'short'}):'—';
renderLista();
llenarHorarios()}
function ordenar(a,b){return (a.fecha+a.hora).localeCompare(b.fecha+b.hora)}
function renderLista(){const filtro=document.querySelector('#filtroFecha').value;
const lista=document.querySelector('#listaEventos');
const items=[...eventos].filter(e=>!filtro||e.fecha===filtro).sort(ordenar);
lista.innerHTML='';
if(!items.length){lista.innerHTML='<div class="empty">No hay eventos para mostrar.</div>';
return}items.forEach(e=>{const d=new Date(e.fecha+'T12:00:00');
const card=document.createElement('div');
card.className='event-card';
card.innerHTML='<div class="date-box"><b>'+d.getDate()+'</b><small>'+d.toLocaleDateString('es-MX',{month:'short'})+'</small></div><div class="event-info"><b></b><small></small></div><span class="event-arrow">›</span>';
card.querySelector('.event-info b').textContent=e.cliente;
card.querySelector('.event-info small').textContent=horaAMPM(e.hora)+' · '+e.tipo;
card.addEventListener('click',()=>abrirDetalle(e.id));
lista.append(card)})}
document.querySelector('#filtroFecha').addEventListener('change',renderLista);

form.addEventListener('submit',ev=>{ev.preventDefault();
const data=Object.fromEntries(new FormData(form).entries());
data.resta=String(Math.max(0,Number(data.precio||0)-Number(data.anticipo||0)));
const inicioNuevo=minutosHora(data.hora),finNuevo=inicioNuevo+duracionMinutos(data.duracion);
if(eventos.some(e=>{if(e.id===editandoId||e.fecha!==data.fecha)return false;const inicioExistente=minutosHora(e.hora),finExistente=inicioExistente+duracionMinutos(e.duracion);return seCruzan(inicioNuevo,finNuevo,inicioExistente,finExistente)})){document.querySelector('#formMsg').textContent='Ese horario se cruza con otra reservación. Elige otro.';return}if(editandoId){
const indice=eventos.findIndex(e=>e.id===editandoId);
if(indice>=0){data.id=editandoId;eventos[indice]=data;}
editandoId=null;
document.querySelector('#guardarEventoBtn').textContent='＋ Guardar evento';
document.querySelector('#cancelarEdicionBtn').hidden=true;
fechaInput.min=fechaLocal(hoy);
document.querySelector('.panel-head .eyebrow').textContent='NUEVA RESERVACIÓN';
document.querySelector('#formMsg').textContent='¡Cambios guardados correctamente!';
}else{
data.id=String(Date.now());
eventos.push(data);
document.querySelector('#formMsg').textContent='¡Evento guardado correctamente!';
}
guardar();
actualizar();
form.reset();
actualizarResta();
form.elements.fecha.value=fechaLocal(hoy);
llenarHorarios();
});

function abrirDetalle(id){seleccionado=eventos.find(e=>e.id===id);
if(!seleccionado)return;
const e=seleccionado;
const campos=[['Cliente',e.cliente],['Festejado(a)',e.festejado||'No especificado'],['Municipio',e.municipio||'No especificado'],['Teléfono',e.telefono],['Fecha',textoFecha(e.fecha)],['Horario',horaAMPM(e.hora)+' - '+horaAMPM(String(Math.floor((minutosHora(e.hora)+duracionMinutos(e.duracion))/60)%24).padStart(2,'0')+':'+String((minutosHora(e.hora)+duracionMinutos(e.duracion))%60).padStart(2,'0'))],['Tipo',e.tipo],['Duración',e.duracion],['Domicilio',e.domicilio],['Costo total',e.precio||'No especificado'],['Anticipo',e.anticipo||'No especificado'],['Resta',Math.max(0,Number(e.precio||0)-Number(e.anticipo||0))],['Notas',e.notas||'Sin notas']]
const cont=document.querySelector('#detalleContenido');
cont.innerHTML='<div class="detail-grid">'+campos.map(([k,v])=>'<div class="detail '+(k==='Domicilio'||k==='Notas'?'wide':'')+'"><small>'+k+'</small><b></b></div>').join('')+'</div>';
cont.querySelectorAll('.detail b').forEach((b,i)=>b.textContent=campos[i][1]);
dialog.showModal()}
document.querySelector('#cerrarDialog').onclick=()=>dialog.close();
document.querySelector('#editarBtn').onclick=()=>{
if(!seleccionado)return;
editandoId=seleccionado.id;
const e=seleccionado;
Object.keys(e).forEach(k=>{if(form.elements[k])form.elements[k].value=e[k]??''});
actualizarResta();
fechaInput.min='';
document.querySelector('#guardarEventoBtn').textContent='Guardar cambios';
document.querySelector('#cancelarEdicionBtn').hidden=false;
document.querySelector('.panel-head .eyebrow').textContent='EDITANDO RESERVACIÓN';
document.querySelector('#formMsg').textContent='Modifica los datos y presiona Guardar cambios.';
dialog.close();
llenarHorarios();
document.querySelector('#eventoForm').scrollIntoView({behavior:'smooth',block:'start'});
};
document.querySelector('#cancelarEdicionBtn').onclick=()=>{
editandoId=null;form.reset();actualizarResta();fechaInput.min=fechaLocal(hoy);fechaInput.value=fechaLocal(hoy);
document.querySelector('#guardarEventoBtn').textContent='＋ Guardar evento';
document.querySelector('#cancelarEdicionBtn').hidden=true;
document.querySelector('.panel-head .eyebrow').textContent='NUEVA RESERVACIÓN';
document.querySelector('#formMsg').textContent='Edición cancelada.';
llenarHorarios();
};


function mensajeWhats(e){const total=e.precio||'Por confirmar',anticipo=e.anticipo||'Por confirmar',resta=e.precio?Math.max(0,Number(e.precio)-Number(e.anticipo||0)):'Por confirmar';return 'Hola, te comparto los datos de la reservación de '+encodeURIComponent(config.showName)+':%0A%0ACliente: '+encodeURIComponent(e.cliente)+'%0ATeléfono: '+encodeURIComponent(e.telefono)+'%0AFecha: '+encodeURIComponent(textoFecha(e.fecha))+'%0AHorario: '+encodeURIComponent(horaAMPM(e.hora)+' - '+horaAMPM(String(Math.floor((minutosHora(e.hora)+duracionMinutos(e.duracion))/60)%24).padStart(2,'0')+':'+String((minutosHora(e.hora)+duracionMinutos(e.duracion))%60).padStart(2,'0')))+'%0AEvento: '+encodeURIComponent(e.tipo)+'%0ADuración: '+encodeURIComponent(e.duracion)+'%0ADomicilio: '+encodeURIComponent(e.domicilio)+'%0ACosto total: '+encodeURIComponent(total)+'%0AAnticipo: '+encodeURIComponent(anticipo)+'%0AResta: '+encodeURIComponent(resta)+'%0ANotas: '+encodeURIComponent(e.notas||'Ninguna')}
function abrirWhatsApp(numero){if(!seleccionado)return;
const tel=numero.replace(/\D/g,'');
const url='https://wa.me/'+tel+'?text='+mensajeWhats(seleccionado);
window.open(url,'_blank','noopener')}
document.querySelector('#whatsAppBtn').onclick=()=>abrirWhatsApp(config.whatsapp);

document.querySelector('#clienteWhatsAppBtn').onclick=()=>{
descargarContratoPDF();
};

function descargarContratoPDF(){
if(!seleccionado)return;
if(!window.jspdf||!window.jspdf.jsPDF){alert('No se pudo cargar el generador de PDF. Revisa tu conexión a internet e inténtalo de nuevo.');return}
if(!config.pdfBackgroundData){alert('Primero sube la imagen de tu contrato en Personalizar mi contrato.');return}
const e=seleccionado,{jsPDF}=window.jspdf;
const pdf=new jsPDF({unit:'mm',format:'letter',orientation:'portrait'});
const ancho=pdf.internal.pageSize.getWidth(),alto=pdf.internal.pageSize.getHeight();
try{pdf.addImage(config.pdfBackgroundData,'JPEG',0,0,ancho,alto,'plantillaContrato','FAST')}catch(err){console.error(err);alert('No se pudo colocar la imagen del contrato. Vuelve a subirla e inténtalo de nuevo.');return}
const sx=ancho/1087,sy=alto/1407;
const color=[20,20,20];
function escribir(valor,x,y,w,h,tam=12,alineacion='left',negrita=true){
  if(valor===undefined||valor===null||String(valor).trim()==='')return;
  // Las coordenadas están definidas en píxeles de la plantilla original; convertirlas a milímetros del PDF.
  x*=sx;y*=sy;w*=sx;h*=sy;
  pdf.setFont('helvetica',negrita?'bold':'normal');
  pdf.setFontSize(tam);
  pdf.setTextColor(...color);
  const margen=3*sx;
  const lineas=pdf.splitTextToSize(String(valor),Math.max(5,w-margen*2));
  const altoLinea=tam*0.36;
  const maxLineas=Math.max(1,Math.floor((h-2*sy)/altoLinea));
  const visibles=lineas.slice(0,maxLineas);
  const yy=y+h/2-(visibles.length-1)*altoLinea/2+tam*0.12;
  visibles.forEach((linea,i)=>{
    if(alineacion==='center')pdf.text(linea,x+w/2,yy+i*altoLinea,{align:'center'});
    else if(alineacion==='right')pdf.text(linea,x+w-margen,yy+i*altoLinea,{align:'right'});
    else pdf.text(linea,x+margen,yy+i*altoLinea);
  });
}
const fin=minutosHora(e.hora)+duracionMinutos(e.duracion);
const horaFin=String(Math.floor(fin/60)%24).padStart(2,'0')+':'+String(fin%60).padStart(2,'0');
const fecha=textoFecha(e.fecha);
const hora=horaAMPM(e.hora)+' - '+horaAMPM(horaFin);
const total=Number(e.precio||0),anticipo=Number(e.anticipo||0),resta=Math.max(0,total-anticipo);
const pesos=n=>n?'$'+n.toLocaleString('es-MX'):'';
// Los cuadros se mapean sobre la plantilla cargada; no se dibujan cajas nuevas.
escribir(e.municipio,360,285,195,53,19);
escribir(fecha,717,285,345,53,15);
escribir(e.cliente,240,349,790,57,20);
escribir(e.telefono,257,415,285,55,18);
escribir(hora,717,415,345,55,18);
escribir(e.domicilio,382,477,680,115,17);
escribir([e.festejado,e.edad?`Cumple ${e.edad} años`:'' ].filter(Boolean).join(' · '),390,603,640,57,19);
escribir(pesos(total),200,1208,184,97,23,'center');
escribir(pesos(anticipo),598,1208,143,97,23,'center');
escribir(pesos(resta),898,1208,183,97,23,'center');
escribir(e.cliente,182,1323,444,57,18,'center');
escribir(config.representative||'REPRESENTANTE',840,1323,237,57,16,'center');
const nombre=(e.cliente||'cliente').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/[^a-zA-Z0-9_-]/g,'_');
pdf.save('Contrato_Desafios_Locos_'+nombre+'.pdf');
}
document.querySelector('#eliminarBtn').onclick=()=>{
  if(!seleccionado||!confirm('¿Seguro que deseas eliminar este evento?'))return;
  eventos=eventos.filter(e=>e.id!==seleccionado.id);
  guardar();
  dialog.close();
  actualizar();
};

actualizar();
