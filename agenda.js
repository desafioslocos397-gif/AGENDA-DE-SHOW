const STORAGE_KEY='desafiosLocosAgendaV1';
const CONFIG_KEY='agendaShowConfigV1';
const CONFIG_DEFAULTS={
showName:'DESAFÍOS LOCOS',representative:'DANIEL LEON',whatsapp:'811 027 6858',
tiktok:'@desafiolocosmtv',facebook:'Desafios locos mtv',youtube:'@DESAFIOSLOCOS',instagram:'desafioslocosmtv',
includes:'1 HORA DE SHOW 100% DINÁMICO\\nANIMACIÓN CÓMICA\\nPREMIOS PARA CONCURSANTES\\nDESAFÍOS Y CONCURSOS\\nLLUVIA DE BURBUJAS\\nPELOTAS GIGANTES\\nCARNAVAL Y BANDERINES\\nPARTICIPACIÓN EN EL PASTEL\\nEQUIPO DE SONIDO',
clauses:'1. Cada contratación requiere de un anticipo para apartar fecha y horario del evento.\\n2. En caso de que el artista no pueda presentarse, otro cubrirá su lugar siendo de la misma calidad.\\n3. En caso de cancelar su evento, su anticipo no será devuelto.\\n4. Firme si usted está de acuerdo.\\n5. No se pueden entregar alimentos durante el show ni dulces, etc.\\n6. Los inflables se tienen que apagar durante el show; no debe haber ninguna distracción durante el show.'
};
function leerConfig(){try{return {...CONFIG_DEFAULTS,...JSON.parse(localStorage.getItem(CONFIG_KEY)||'{}')}}catch{return {...CONFIG_DEFAULTS}}}
let config=leerConfig();
function guardarConfig(){localStorage.setItem(CONFIG_KEY,JSON.stringify(config))}
function prepararFormularioConfig(){const f=document.querySelector('#configForm');Object.keys(config).forEach(k=>{if(f.elements[k])f.elements[k].value=config[k]??''})}
const configDialog=document.querySelector('#configDialog');
document.querySelector('#configurarContratoBtn').addEventListener('click',()=>{prepararFormularioConfig();document.querySelector('#configMsg').textContent='';configDialog.showModal()});
document.querySelector('#cerrarConfig').addEventListener('click',()=>configDialog.close());
document.querySelector('#configForm').addEventListener('submit',ev=>{ev.preventDefault();config={...CONFIG_DEFAULTS,...Object.fromEntries(new FormData(ev.currentTarget).entries())};guardarConfig();document.querySelector('#configMsg').textContent='Tu contrato quedó guardado en este navegador.'});
document.querySelector('#restaurarConfig').addEventListener('click',()=>{if(!confirm('¿Restaurar los datos iniciales del contrato?'))return;config={...CONFIG_DEFAULTS};guardarConfig();prepararFormularioConfig();document.querySelector('#configMsg').textContent='Se restauraron los datos iniciales.'});

const horarios=['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00'];

const form=document.querySelector('#eventoForm'), horaSelect=form.elements.hora, fechaInput=form.elements.fecha;

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
function horaAMPM(h){const [hh,mm]=h.split(':').map(Number);const sufijo=hh>=12?'PM':'AM';const hora=hh%12||12;return hora+':'+String(mm).padStart(2,'0')+' '+sufijo}
function seCruzan(inicioA,finA,inicioB,finB){return inicioA<finB&&inicioB<finA}
function llenarHorarios(){const fecha=fechaInput.value;
horaSelect.innerHTML='<option value="">Selecciona horario</option>';
horarios.forEach(h=>{const inicio=minutosHora(h),fin=inicio+duracionMinutos(form.elements.duracion.value);
const ocupado=eventos.some(e=>{if(e.id===editandoId||e.fecha!==fecha)return false;const otroInicio=minutosHora(e.hora),otroFin=otroInicio+duracionMinutos(e.duracion);return seCruzan(inicio,fin,otroInicio,otroFin)});
const o=document.createElement('option');o.value=h;o.textContent=horaAMPM(h)+(ocupado?' · OCUPADO':'');o.disabled=ocupado;horaSelect.append(o)})}
fechaInput.addEventListener('change',llenarHorarios);
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
form.elements.fecha.value=fechaLocal(hoy);
llenarHorarios();
});

function abrirDetalle(id){seleccionado=eventos.find(e=>e.id===id);
if(!seleccionado)return;
const e=seleccionado;
const campos=[['Cliente',e.cliente],['Festejado(a)',e.festejado||'No especificado'],['Municipio',e.municipio||'No especificado'],['Teléfono',e.telefono],['Fecha',textoFecha(e.fecha)],['Horario',horaAMPM(e.hora)+' - '+horaAMPM(String(Math.floor((minutosHora(e.hora)+duracionMinutos(e.duracion))/60)%24).padStart(2,'0')+':'+String((minutosHora(e.hora)+duracionMinutos(e.duracion))%60).padStart(2,'0'))],['Tipo',e.tipo],['Duración',e.duracion],['Domicilio',e.domicilio],['Precio',e.precio?'$'+Number(e.precio).toLocaleString('es-MX')+' MXN':'No especificado'],['Anticipo',e.anticipo?'$'+Number(e.anticipo).toLocaleString('es-MX')+' MXN':'No especificado'],['Notas',e.notas||'Sin notas']];
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
editandoId=null;form.reset();fechaInput.min=fechaLocal(hoy);fechaInput.value=fechaLocal(hoy);
document.querySelector('#guardarEventoBtn').textContent='＋ Guardar evento';
document.querySelector('#cancelarEdicionBtn').hidden=true;
document.querySelector('.panel-head .eyebrow').textContent='NUEVA RESERVACIÓN';
document.querySelector('#formMsg').textContent='Edición cancelada.';
llenarHorarios();
};


function mensajeWhats(e){return 'Hola, te comparto los datos de la reservación de '+encodeURIComponent(config.showName)+':%0A%0ACliente: '+encodeURIComponent(e.cliente)+'%0ATeléfono: '+encodeURIComponent(e.telefono)+'%0AFecha: '+encodeURIComponent(textoFecha(e.fecha))+'%0AHorario: '+encodeURIComponent(horaAMPM(e.hora)+' - '+horaAMPM(String(Math.floor((minutosHora(e.hora)+duracionMinutos(e.duracion))/60)%24).padStart(2,'0')+':'+String((minutosHora(e.hora)+duracionMinutos(e.duracion))%60).padStart(2,'0')))+'%0AEvento: '+encodeURIComponent(e.tipo)+'%0ADuración: '+encodeURIComponent(e.duracion)+'%0ADomicilio: '+encodeURIComponent(e.domicilio)+'%0APrecio: '+encodeURIComponent(e.precio||'Por confirmar')+'%0AAnticipo: '+encodeURIComponent(e.anticipo||'Por confirmar')+'%0ANotas: '+encodeURIComponent(e.notas||'Ninguna')}
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
const e=seleccionado,{jsPDF}=window.jspdf,pdf=new jsPDF({unit:'mm',format:'letter'});
const ancho=pdf.internal.pageSize.getWidth(),altoPagina=pdf.internal.pageSize.getHeight(),margen=16,util=ancho-margen*2;
let y=14;
const color=[45,40,65],morado=[103,70,220];
const texto=(s,x,yy,tam=8.5,negrita=false)=>{pdf.setFont('helvetica',negrita?'bold':'normal');pdf.setFontSize(tam);pdf.setTextColor(...color);pdf.text(String(s||'No especificado'),x,yy)};
const seccion=(t)=>{y+=2;pdf.setFillColor(239,236,250);pdf.roundedRect(margen,y,util,7,1.5,1.5,'F');texto(t.toUpperCase(),margen+3,y+4.8,9,true);y+=11};
const campo=(etiqueta,valor,x,yy,w)=>{pdf.setFont('helvetica','bold');pdf.setFontSize(8.2);const anchoEtiqueta=pdf.getTextWidth(etiqueta)+4;texto(etiqueta,x,yy,8.2,true);pdf.setFont('helvetica','normal');pdf.setFontSize(8.5);pdf.setTextColor(...color);const espacio=Math.min(anchoEtiqueta,w*0.48);const lines=pdf.splitTextToSize(String(valor||'No especificado'),Math.max(15,w-espacio));pdf.text(lines,x+espacio,yy);return Math.max(6,lines.length*4.2)};
const parrafo=(s)=>{pdf.setFont('helvetica','normal');pdf.setFontSize(8.2);const lines=pdf.splitTextToSize(s,util-2);pdf.setTextColor(...color);pdf.text(lines,margen+1,y);y+=lines.length*4.4+2};
const fin=minutosHora(e.hora)+duracionMinutos(e.duracion);
const horaFin=String(Math.floor(fin/60)%24).padStart(2,'0')+':'+String(fin%60).padStart(2,'0');
const mitad=(util-12)/2;
// Encabezado amplio
pdf.setFillColor(35,28,65);pdf.roundedRect(margen,y,util,29,2.5,2.5,'F');
pdf.setTextColor(255,255,255);pdf.setFont('helvetica','bold');pdf.setFontSize(19);pdf.text(String(config.showName||'SHOW').toUpperCase(),margen+7,y+11);
pdf.setFontSize(11);pdf.text('CONTRATO DE SERVICIO DE SHOW',margen+7,y+19);
pdf.setFont('helvetica','normal');pdf.setFontSize(8);
pdf.text(('TikTok: '+(config.tiktok||'')+'  |  Facebook: '+(config.facebook||'')+'  |  YouTube: '+(config.youtube||'')).slice(0,115),margen+7,y+25);
y+=35;
if(config.instagram)texto('Instagram: '+config.instagram,margen,y,8.5);
y+=5;
texto('WhatsApp: '+(config.whatsapp||'No especificado'),margen,y,9,true);
y+=8;
// Datos del evento
seccion('Datos del evento');
let y1=y,y2=y;
y1+=campo('MUNICIPIO:',e.municipio,margen,y1,mitad);
y2+=campo('FECHA:',textoFecha(e.fecha),margen+mitad+12,y2,mitad);
y=Math.max(y1,y2)+4;
y1=y;y2=y;
y1+=campo('NOMBRE:',e.cliente,margen,y1,mitad);
y2+=campo('TELÉFONO:',e.telefono,margen+mitad+12,y2,mitad);
y=Math.max(y1,y2)+4;
y1=y;y2=y;
y1+=campo('HORARIO:',horaAMPM(e.hora)+' a '+horaAMPM(horaFin),margen,y1,mitad);
y2+=campo('FESTEJADO:',e.festejado||'No especificado',margen+mitad+12,y2,mitad);
y=Math.max(y1,y2)+4;
texto('LUGAR DEL EVENTO:',margen,y,8.2,true);y+=5;pdf.setFont('helvetica','normal');pdf.setFontSize(8.5);pdf.setTextColor(...color);const direccionLines=pdf.splitTextToSize(String(e.domicilio||'No especificado'),util-4);pdf.text(direccionLines,margen+2,y);y+=Math.max(6,direccionLines.length*4.2)+2;
// Qué incluye
seccion('Qué incluye nuestro show');
const incluye=String(config.includes||'').split(/\\r?\\n/).map(x=>x.trim()).filter(Boolean);
const colW=util/3;
incluye.forEach((item,i)=>{const col=i%3,fila=Math.floor(i/3);texto('• '+item,margen+col*colW,y+fila*7,7.6,true)});
y+=Math.ceil(incluye.length/3)*7+3;
// Términos
seccion('Términos y condiciones');
const clausulas=String(config.clauses||'').split(/\\r?\\n/).map(x=>x.trim()).filter(Boolean);
clausulas.forEach(parrafo);
// Costos en tres columnas amplias
seccion('Costos');
const total=Number(e.precio||0),anticipo=Number(e.anticipo||0),resta=total-anticipo;
const costos=[['COSTO TOTAL:',total?'$'+total.toLocaleString('es-MX')+' PESOS':'Por confirmar'],['ANTICIPO:',anticipo?'$'+anticipo.toLocaleString('es-MX')+' PESOS':'Por confirmar'],['RESTA:',total?'$'+resta.toLocaleString('es-MX')+' PESOS':'Por confirmar']];
costos.forEach((c,i)=>{const x=margen+i*(util/3);pdf.setFillColor(247,246,251);pdf.roundedRect(x,y,util/3-3,15,1.5,1.5,'F');texto(c[0],x+3,y+5,7.5,true);texto(c[1],x+3,y+11,8.5,true)});
y+=21;
// Firmas con espacio amplio
seccion('Firmas');
const firmaY=y+13;
pdf.setDrawColor(90);pdf.setLineWidth(0.4);
texto('CONTRATANTE:',margen,firmaY,8,true);
pdf.setFont('helvetica','bold');pdf.setFontSize(10);pdf.setTextColor(...color);
const nombreCliente=pdf.splitTextToSize(String(e.cliente||'No especificado'),mitad-25);
pdf.text(nombreCliente,margen+28,firmaY);
const xRep=margen+util/2+6;
pdf.line(xRep,firmaY-2,xRep+mitad-8,firmaY-2);
texto('FIRMA DEL REPRESENTANTE',xRep,firmaY+5,7.5,true);
texto(config.representative||'REPRESENTANTE',xRep,firmaY+10,9,true);
texto((config.showName||'SHOW')+'  ·  WhatsApp: '+(config.whatsapp||''),margen,altoPagina-9,7.5);
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
