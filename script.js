// Mobile nav
function toggleMenu(){
  const nav = document.getElementById('mainNav') || document.querySelector('.nav');
  nav.classList.toggle('open');
}

// Año dinámico
const yEl = document.getElementById('year');
if (yEl) yEl.textContent = new Date().getFullYear();

// Agenda modal (se mantiene para Home/Servicios)
function openAgenda(e){ if(e) e.preventDefault(); document.getElementById('agendaModal').setAttribute('aria-hidden','false'); }
function closeAgenda(){ document.getElementById('agendaModal').setAttribute('aria-hidden','true'); document.getElementById('agendaResult')?.setAttribute('hidden',''); }

// Crear cita ICS + mensaje WhatsApp (se usa en Home/Servicios)
function crearCitaICS(ev){
  ev.preventDefault();
  const f = ev.target;
  const nombre = f.nombre.value.trim();
  const empresa = f.empresa?.value.trim() || '';
  const ciudad = f.ciudad.value.trim();
  const sector = f.sector.value;
  const fecha = f.fecha.value;     // YYYY-MM-DD
  const hora = f.hora.value;       // HH:MM
  if(!fecha || !hora){ alert('Selecciona fecha y hora'); return false; }
  const start = new Date(`${fecha}T${hora}:00`);
  const end = new Date(start.getTime() + 60*60*1000); // 1h

  function fmt(d){ return d.toISOString().replace(/[-:]/g,'').split('.')[0] + 'Z'; }
  const ics = [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Ozonix//Agenda//ES',
    'BEGIN:VEVENT',
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    'SUMMARY:Visita técnica - Ozonix Purificación',
    `LOCATION:${ciudad}`,
    `DESCRIPTION:Contacto: ${nombre}${empresa? ' - '+empresa : ''}. Sector: ${sector}.`,
    'END:VEVENT','END:VCALENDAR'
  ].join('\r\n');

  // Descargar ICS
  const blob = new Blob([ics], {type:'text/calendar;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'Visita-Ozonix.ics'; a.click();

  // Mensaje para WhatsApp
  const msg = `Hola, soy ${nombre}${empresa? ' de '+empresa : ''}. Quiero agendar una visita técnica en ${ciudad} para el sector ${sector} el ${fecha} a las ${hora}.`;
  const wurl = `https://wa.me/573000000000?text=${encodeURIComponent(msg)}`;

  const result = document.getElementById('agendaResult');
  if(result){
    result.innerHTML = `<p>✅ Cita creada. <a class="btn btn--outline btn--sm" target="_blank" rel="noopener" href="${wurl}">Confirmar por WhatsApp</a></p>`;
    result.removeAttribute('hidden');
  }
  return false;
}

// Contacto (demo local)
function enviarContacto(ev){
  ev.preventDefault();
  document.getElementById('contactoOk')?.removeAttribute('hidden');
  // Integrar con tu backend o servicio de formularios si deseas (Formspree, EmailJS, etc.)
  return false;
}

// Cargar y filtrar consumibles
let _consumibles = [];
async function cargarConsumibles(url){
  try{
    const res = await fetch(url); _consumibles = await res.json();
    renderConsumibles(_consumibles);
  }catch(e){
    console.error('No se pudo cargar consumibles:', e);
  }
}
function renderConsumibles(items){
  const tbody = document.querySelector('#tablaConsumibles tbody');
  if(!tbody) return;
  tbody.innerHTML = items.map(it => `
    <tr>
      <td>${it.categoria}</td>
      <td>${it.producto}</td>
      <td>${it.modelo}</td>
      <td>${it.micras}</td>
      <td>${it.material}</td>
      <td>${it.caudal}</td>
      <td>${it.marca}</td>
      <td>${it.stock ? 'Disponible' : 'Agotado'}</td>
    </tr>
  `).join('');
}
function filtrarConsumibles(){
  const q = document.getElementById('q')?.value.toLowerCase() || '';
  const cat = document.getElementById('cat')?.value || '';
  const mic = document.getElementById('micraje')?.value || '';
  const marca = document.getElementById('marca')?.value || '';

  const out = _consumibles.filter(x => {
    const matchQ = !q || `${x.producto} ${x.modelo} ${x.marca}`.toLowerCase().includes(q);
    const matchC = !cat || x.categoria === cat;
    const matchM = !mic || String(x.micras) === mic;
    const matchB = !marca || x.marca === marca;
    return matchQ && matchC && matchM && matchB;
  });
  renderConsumibles(out);
}
