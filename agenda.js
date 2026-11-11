const STORAGE_KEY='desafiosLocosAgendaV1';

const horarios=['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00'];

const form=document.querySelector('#eventoForm'), horaSelect=form.elements.hora, fechaInput=form.elements.fecha;

const dialog=document.querySelector('#detalleDialog');
let eventos=leerEventos(), seleccionado=null;

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
const ocupado=eventos.some(e=>{if(e.fecha!==fecha)return false;const otroInicio=minutosHora(e.hora),otroFin=otroInicio+duracionMinutos(e.duracion);return seCruzan(inicio,fin,otroInicio,otroFin)});
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
if(eventos.some(e=>{if(e.fecha!==data.fecha)return false;const inicioExistente=minutosHora(e.hora),finExistente=inicioExistente+duracionMinutos(e.duracion);return seCruzan(inicioNuevo,finNuevo,inicioExistente,finExistente)})){document.querySelector('#formMsg').textContent='Ese horario se cruza con otra reservación. Elige otro.';return}data.id=String(Date.now());
eventos.push(data);
guardar();
actualizar();
form.reset();
form.elements.fecha.value=fechaLocal(hoy);
llenarHorarios();
document.querySelector('#formMsg').textContent='¡Evento guardado correctamente!';
});

function abrirDetalle(id){seleccionado=eventos.find(e=>e.id===id);
if(!seleccionado)return;
const e=seleccionado;
const campos=[['Cliente',e.cliente],['Teléfono',e.telefono],['Fecha',textoFecha(e.fecha)],['Horario',horaAMPM(e.hora)+' - '+horaAMPM(String(Math.floor((minutosHora(e.hora)+duracionMinutos(e.duracion))/60)%24).padStart(2,'0')+':'+String((minutosHora(e.hora)+duracionMinutos(e.duracion))%60).padStart(2,'0'))],['Tipo',e.tipo],['Duración',e.duracion],['Domicilio',e.domicilio],['Precio',e.precio?'$'+Number(e.precio).toLocaleString('es-MX')+' MXN':'No especificado'],['Anticipo',e.anticipo?'$'+Number(e.anticipo).toLocaleString('es-MX')+' MXN':'No especificado'],['Notas',e.notas||'Sin notas']];
const cont=document.querySelector('#detalleContenido');
cont.innerHTML='<div class="detail-grid">'+campos.map(([k,v])=>'<div class="detail '+(k==='Domicilio'||k==='Notas'?'wide':'')+'"><small>'+k+'</small><b></b></div>').join('')+'</div>';
cont.querySelectorAll('.detail b').forEach((b,i)=>b.textContent=campos[i][1]);
dialog.showModal()}
document.querySelector('#cerrarDialog').onclick=()=>dialog.close();

function mensajeWhats(e){return 'Hola, te comparto los datos de la reservación de Desafíos Locos:%0A%0ACliente: '+encodeURIComponent(e.cliente)+'%0ATeléfono: '+encodeURIComponent(e.telefono)+'%0AFecha: '+encodeURIComponent(textoFecha(e.fecha))+'%0AHorario: '+encodeURIComponent(horaAMPM(e.hora)+' - '+horaAMPM(String(Math.floor((minutosHora(e.hora)+duracionMinutos(e.duracion))/60)%24).padStart(2,'0')+':'+String((minutosHora(e.hora)+duracionMinutos(e.duracion))%60).padStart(2,'0')))+'%0AEvento: '+encodeURIComponent(e.tipo)+'%0ADuración: '+encodeURIComponent(e.duracion)+'%0ADomicilio: '+encodeURIComponent(e.domicilio)+'%0APrecio: '+encodeURIComponent(e.precio||'Por confirmar')+'%0AAnticipo: '+encodeURIComponent(e.anticipo||'Por confirmar')+'%0ANotas: '+encodeURIComponent(e.notas||'Ninguna')}
function abrirWhatsApp(numero){if(!seleccionado)return;
const tel=numero.replace(/\D/g,'');
const url='https://wa.me/'+tel+'?text='+mensajeWhats(seleccionado);
window.open(url,'_blank','noopener')}
document.querySelector('#whatsAppBtn').onclick=()=>abrirWhatsApp('528110276858');

document.querySelector('#clienteWhatsAppBtn').onclick=()=>{
if(!seleccionado)return;
const tel=seleccionado.telefono.replace(/\D/g,'');
const numero=tel.length===10?'52'+tel:tel;
const url='https://wa.me/'+numero+'?text='+mensajeWhats(seleccionado);
const ventana=window.open(url,'_blank');
descargarContratoPDF();
if(!ventana)alert('El contrato se descargó. Tu navegador bloqueó la ventana de WhatsApp; permite las ventanas emergentes e inténtalo de nuevo.');
};

function descargarContratoPDF(){
if(!seleccionado)return;
if(!window.jspdf||!window.jspdf.jsPDF){alert('No se pudo cargar el generador de PDF. Revisa tu conexión a internet e inténtalo de nuevo.');return}
const e=seleccionado,{jsPDF}=window.jspdf,pdf=new jsPDF({unit:'mm',format:'a4'});
const ancho=pdf.internal.pageSize.getWidth(),margen=18,util=ancho-margen*2;let y=20;
const campo=(etiqueta,valor)=>{pdf.setFont('helvetica','bold');pdf.setFontSize(10);pdf.text(etiqueta,margen,y);pdf.setFont('helvetica','normal');const lineas=pdf.splitTextToSize(String(valor||'No especificado'),util-38);pdf.text(lineas,margen+38,y);y+=Math.max(8,lineas.length*5+3)};
pdf.setFillColor(35,28,65);pdf.rect(0,0,ancho,38,'F');pdf.setTextColor(255,255,255);pdf.setFont('helvetica','bold');pdf.setFontSize(19);pdf.text('DESAFIOS LOCOS',margen,17);pdf.setFontSize(11);pdf.text('PAYASO PISTOLYN',margen,25);pdf.setFontSize(9);pdf.text('CONTRATO / COMPROBANTE DE RESERVACION',margen,32);
pdf.setTextColor(35,29,55);y=51;pdf.setFont('helvetica','bold');pdf.setFontSize(14);pdf.text('DATOS DEL SERVICIO',margen,y);y+=10;pdf.setDrawColor(103,70,220);pdf.line(margen,y,ancho-margen,y);y+=9;
campo('Cliente:',e.cliente);campo('Telefono:',e.telefono);campo('Fecha:',textoFecha(e.fecha));
const fin=minutosHora(e.hora)+duracionMinutos(e.duracion),horaFin=String(Math.floor(fin/60)%24).padStart(2,'0')+':'+String(fin%60).padStart(2,'0');
campo('Horario:',horaAMPM(e.hora)+' a '+horaAMPM(horaFin));campo('Tipo de evento:',e.tipo);campo('Duracion:',e.duracion);campo('Domicilio:',e.domicilio);campo('Precio:',e.precio?'$'+Number(e.precio).toLocaleString('es-MX')+' MXN':'Por confirmar');
campo('Anticipo:',e.anticipo?'$'+Number(e.anticipo).toLocaleString('es-MX')+' MXN':'Por confirmar');
campo('Notas:',e.notas||'Sin notas');
y+=8;
pdf.setFont('helvetica','normal');
pdf.setFontSize(9);
pdf.text(pdf.splitTextToSize('Este documento contiene los datos registrados para la reservacion del servicio de Desafios Locos. Verifica que toda la informacion sea correcta.',util),margen,y);
y+=25;
pdf.setDrawColor(120);
pdf.line(margen,y,margen+65,y);
pdf.line(ancho-margen-65,y,ancho-margen,y);
y+=5;
pdf.setFontSize(8);
pdf.text('Firma del cliente',margen,y);
pdf.text('Desafios Locos',ancho-margen-65,y);
pdf.text('WhatsApp: 811 027 6858',margen,285);
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
