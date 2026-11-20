/* =========================================================
   ASISTENTE VIRTUAL — TEDEFIENDE.CL
   ---------------------------------------------------------
   Asistente guiado: conversa con botones y reconoce palabras
   clave. Al final arma un resumen y lo envía por WhatsApp.
   No guarda ni envía datos por su cuenta.

   1. CONFIGURACIÓN Y CONVERSACIÓN  ← EDITAR AQUÍ
   2. Palabras clave para el texto libre
   3. Funcionamiento (no es necesario modificar)
   ========================================================= */

(function () {
  "use strict";

  /* =======================================================
     1. CONFIGURACIÓN Y CONVERSACIÓN
     Cada "paso" tiene:
       mensajes: lo que dice el asistente (uno o varios globos)
       opciones: botones. Cada botón tiene:
         texto:   lo que dice el botón
         ir:      el paso al que lleva
         guardar: datos que anota (tema, situación, urgencia)
         enlace:  si es un enlace externo (WhatsApp, mapa, teléfono)
       pedir:     si el paso espera que la persona escriba
                  (nombre, telefono o detalle)
       siguiente: paso al que sigue automáticamente
     En los textos, {nombre} se reemplaza por el nombre ingresado.
     ======================================================= */
  const CONFIG = {
    whatsapp: "56956299095",                 // sin "+" ni espacios
    telefono: "+56956299095",
    mapa: "https://www.google.com/maps/search/?api=1&query=Caupolic%C3%A1n+567+Concepci%C3%B3n",
    saludoTrasSegundos: 5                    // globo de saludo (0 = no mostrar)
  };

  const TEMAS = [
    { texto: "Pensión de alimentos", ir: "alimentos", guardar: { tema: "Pensión de alimentos" } },
    { texto: "Régimen de visitas", ir: "visitas", guardar: { tema: "Régimen de visitas" } },
    { texto: "Divorcio", ir: "divorcio", guardar: { tema: "Divorcio" } },
    { texto: "Herencias y testamentos", ir: "herencias", guardar: { tema: "Herencias y testamentos" } },
    { texto: "Contratos y temas civiles", ir: "civil", guardar: { tema: "Contratos / civil" } },
    { texto: "Otro tema", ir: "otro", guardar: { tema: "Otro tema" } },
    { texto: "Horario y ubicación", ir: "ubicacion" },
    { texto: "¿Cuánto cuesta?", ir: "honorarios" }
  ];

  const PASOS = {
    inicio: {
      mensajes: [
        "¡Hola! Soy el asistente virtual de Tedefiende.cl.",
        "Te oriento en pocos pasos y dejo tu consulta lista para que el abogado Julián Herrera Martínez te contacte. ¿Sobre qué tema es tu consulta?"
      ],
      opciones: TEMAS
    },

    temas: {
      mensajes: ["¿Sobre qué tema es tu consulta?"],
      opciones: TEMAS
    },

    /* ---------- Pensión de alimentos ---------- */
    alimentos: {
      mensajes: [
        "La pensión de alimentos busca cubrir las necesidades de los hijos: alimentación, salud, educación, vivienda y vestuario, entre otras.",
        "Antes de ir a tribunales, por regla general hay que pasar por una mediación familiar. ¿Cuál es tu situación?"
      ],
      opciones: [
        { texto: "Quiero pedir una pensión", ir: "urgencia", guardar: { situacion: "Quiere pedir una pensión" } },
        { texto: "Me están demandando", ir: "urgencia", guardar: { situacion: "Lo/la están demandando" } },
        { texto: "Quiero subir o bajar el monto", ir: "urgencia", guardar: { situacion: "Quiere modificar el monto" } },
        { texto: "No me están pagando", ir: "alimentosDeuda", guardar: { situacion: "No le están pagando la pensión" } }
      ]
    },
    alimentosDeuda: {
      mensajes: [
        "Si la pensión no se está pagando, la ley contempla medidas para exigir el pago, y existe el Registro Nacional de Deudores de Pensiones de Alimentos.",
        "Cada caso es distinto, así que lo mejor es que Julián revise el tuyo."
      ],
      siguiente: "urgencia"
    },

    /* ---------- Régimen de visitas ---------- */
    visitas: {
      mensajes: [
        "El régimen de visitas (la ley lo llama «relación directa y regular») busca que los hijos mantengan el vínculo con el padre o la madre con quien no viven.",
        "También requiere, por regla general, una mediación previa. ¿Cuál es tu situación?"
      ],
      opciones: [
        { texto: "Quiero fijar un régimen de visitas", ir: "urgencia", guardar: { situacion: "Quiere fijar un régimen de visitas" } },
        { texto: "No me dejan ver a mis hijos", ir: "urgencia", guardar: { situacion: "Le impiden ver a sus hijos" } },
        { texto: "Quiero cambiar el régimen actual", ir: "urgencia", guardar: { situacion: "Quiere modificar el régimen" } }
      ]
    },

    /* ---------- Divorcio ---------- */
    divorcio: {
      mensajes: [
        "En Chile existen el divorcio de mutuo acuerdo, el divorcio unilateral y el divorcio por culpa. Los requisitos y plazos dependen de cada tipo.",
        "¿Cuál es tu caso?"
      ],
      opciones: [
        { texto: "Ambos estamos de acuerdo", ir: "urgencia", guardar: { situacion: "Divorcio de mutuo acuerdo" } },
        { texto: "Solo yo quiero divorciarme", ir: "urgencia", guardar: { situacion: "Divorcio unilateral" } },
        { texto: "No estoy seguro/a", ir: "urgencia", guardar: { situacion: "No sabe qué tipo de divorcio" } }
      ]
    },

    /* ---------- Herencias ---------- */
    herencias: {
      mensajes: [
        "Cuando una persona fallece, sus herederos deben tramitar la posesión efectiva para poder disponer de los bienes. Un testamento permite ordenar en vida cómo se repartirán, dentro de los límites que fija la ley.",
        "¿Qué necesitas?"
      ],
      opciones: [
        { texto: "Falleció un familiar", ir: "urgencia", guardar: { situacion: "Falleció un familiar (posesión efectiva)" } },
        { texto: "Quiero hacer un testamento", ir: "urgencia", guardar: { situacion: "Quiere hacer un testamento" } },
        { texto: "Hay conflicto entre herederos", ir: "urgencia", guardar: { situacion: "Conflicto entre herederos" } }
      ]
    },

    /* ---------- Civil ---------- */
    civil: {
      mensajes: ["Te podemos ayudar con contratos, arriendos, cobros y conflictos entre particulares. ¿Qué necesitas?"],
      opciones: [
        { texto: "Revisar o redactar un contrato", ir: "urgencia", guardar: { situacion: "Revisar o redactar un contrato" } },
        { texto: "No cumplieron un contrato", ir: "urgencia", guardar: { situacion: "Incumplimiento de contrato" } },
        { texto: "Problema con un arriendo", ir: "urgencia", guardar: { situacion: "Problema de arriendo" } },
        { texto: "Cobrar una deuda", ir: "urgencia", guardar: { situacion: "Cobro de deuda" } }
      ]
    },

    /* ---------- Otro tema ---------- */
    otro: {
      mensajes: ["Cuéntame en una o dos frases qué necesitas. No es necesario que des detalles privados: esos se los podrás contar directamente a Julián."],
      pedir: "detalle",
      siguiente: "urgencia"
    },

    /* ---------- Datos de contacto ---------- */
    urgencia: {
      mensajes: ["¿Tienes algún plazo, audiencia o notificación reciente?"],
      opciones: [
        { texto: "Sí, es urgente", ir: "nombre", guardar: { urgencia: "Sí, es urgente" } },
        { texto: "No, quiero orientarme", ir: "nombre", guardar: { urgencia: "No" } }
      ]
    },
    nombre: {
      mensajes: ["Perfecto. Para que Julián pueda contactarte, ¿cuál es tu nombre?"],
      pedir: "nombre",
      siguiente: "telefono"
    },
    telefono: {
      mensajes: ["Gracias, {nombre}. ¿A qué número de teléfono o WhatsApp te podemos contactar?"],
      pedir: "telefono",
      siguiente: "resumen"
    },
    resumen: {
      mensajes: [
        "¡Listo, {nombre}! Este es el resumen de tu consulta:",
        "@resumen", // aquí se muestra la tarjeta con los datos
        "Presiona «Enviar por WhatsApp» y le llegará a Julián. Recuerda que la llamada en línea de 10:00 a 12:00 es gratis."
      ],
      opciones: [
        { texto: "Enviar por WhatsApp", enlace: "@whatsapp", estilo: "whatsapp" },
        { texto: "Llamar ahora", enlace: "@telefono", estilo: "principal" },
        { texto: "Empezar de nuevo", ir: "@reiniciar" }
      ]
    },

    /* ---------- Información ---------- */
    ubicacion: {
      mensajes: [
        "Nuestra oficina está en Caupolicán 567, Concepción Centro. También atendemos en línea.",
        "Las llamadas en línea de 10:00 a 12:00 horas son gratis, al +56 9 5629 9095."
      ],
      opciones: [
        { texto: "Ver en Google Maps", enlace: "@mapa" },
        { texto: "Escribir por WhatsApp", enlace: "@whatsappSimple", estilo: "whatsapp" },
        { texto: "Dejar mi consulta", ir: "temas" }
      ]
    },
    honorarios: {
      mensajes: [
        "Los honorarios dependen de cada caso y se explican con claridad antes de comenzar, sin sorpresas.",
        "Además, la llamada en línea de 10:00 a 12:00 horas es gratis, para que puedas contar tu caso sin compromiso."
      ],
      opciones: [
        { texto: "Dejar mi consulta", ir: "temas" },
        { texto: "Llamar ahora", enlace: "@telefono", estilo: "principal" }
      ]
    },

    /* ---------- Cuando no se entiende el texto ---------- */
    noEntendi: {
      mensajes: ["Disculpa, no estoy seguro de haber entendido. Elige una de estas opciones, o escríbele directamente a Julián por WhatsApp."],
      opciones: TEMAS.concat([{ texto: "Escribir por WhatsApp", enlace: "@whatsappSimple", estilo: "whatsapp" }])
    }
  };


  /* =======================================================
     2. PALABRAS CLAVE PARA EL TEXTO LIBRE
     Si la persona escribe en vez de usar los botones, se
     busca la primera regla que coincida.
     ======================================================= */
  const PALABRAS_CLAVE = [
    { palabras: ["pension", "alimento", "manutencion", "mantencion"], ir: "alimentos", guardar: { tema: "Pensión de alimentos" } },
    { palabras: ["visita", "ver a mis hijos", "ver a mi hijo", "relacion directa"], ir: "visitas", guardar: { tema: "Régimen de visitas" } },
    { palabras: ["divorci", "separar", "separacion", "matrimonio"], ir: "divorcio", guardar: { tema: "Divorcio" } },
    { palabras: ["herencia", "testamento", "posesion efectiva", "fallec", "murio", "heredero"], ir: "herencias", guardar: { tema: "Herencias y testamentos" } },
    { palabras: ["cuanto cuesta", "cuanto sale", "cuanto cobra", "precio", "honorario", "cobran", "cobras", "gratis", "tarifa"], ir: "honorarios" },
    { palabras: ["contrato", "arriendo", "arrendatario", "deuda", "cobrar", "cobro", "pagare"], ir: "civil", guardar: { tema: "Contratos / civil" } },
    { palabras: ["donde estan", "donde queda", "direccion", "ubicacion", "oficina", "horario", "que hora", "atienden"], ir: "ubicacion" },
    { palabras: ["hola", "buenas", "buenos dias", "buenas tardes", "ayuda"], ir: "temas" }
  ];


  /* =======================================================
     3. FUNCIONAMIENTO
     ======================================================= */
  const raiz = document.getElementById("asistente");
  if (!raiz) return;

  const panel = document.getElementById("asistentePanel");
  const lanzador = document.getElementById("asistenteLanzador");
  const burbuja = document.getElementById("asistenteBurbuja");
  const zonaMensajes = document.getElementById("asistenteMensajes");
  const zonaOpciones = document.getElementById("asistenteOpciones");
  const formulario = document.getElementById("asistenteFormulario");
  const campoTexto = document.getElementById("asistenteTexto");
  const movimientoReducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let datos = {};            // lo que la persona va contando
  let esperando = null;      // campo que se espera por texto (nombre, telefono, detalle)
  let pasoSiguiente = null;  // paso que sigue después del texto esperado
  let iniciado = false;
  let ocupado = false;       // mientras el asistente "escribe"

  /* ---------- utilidades ---------- */
  function normalizar(texto) {
    return texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }

  function rellenar(texto) {
    return texto.replace(/\{nombre\}/g, datos.nombre ? datos.nombre.split(" ")[0] : "");
  }

  function esperar(ms) {
    return new Promise(function (resolver) { setTimeout(resolver, movimientoReducido ? 0 : ms); });
  }

  function bajarAlFinal() {
    zonaMensajes.scrollTop = zonaMensajes.scrollHeight;
  }

  function textoWhatsApp(completo) {
    if (!completo) return "Hola, vengo de la web tedefiende.cl y quiero hacer una consulta.";
    const lineas = ["Hola, vengo de la web tedefiende.cl y quiero hacer una consulta.", ""];
    if (datos.nombre) lineas.push("Nombre: " + datos.nombre);
    if (datos.telefono) lineas.push("Teléfono: " + datos.telefono);
    if (datos.tema) lineas.push("Tema: " + datos.tema);
    if (datos.situacion) lineas.push("Situación: " + datos.situacion);
    if (datos.detalle) lineas.push("Detalle: " + datos.detalle);
    if (datos.urgencia) lineas.push("¿Urgente?: " + datos.urgencia);
    return lineas.join("\n");
  }

  function resolverEnlace(clave) {
    switch (clave) {
      case "@whatsapp": return "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(textoWhatsApp(true));
      case "@whatsappSimple": return "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(textoWhatsApp(false));
      case "@telefono": return "tel:" + CONFIG.telefono;
      case "@mapa": return CONFIG.mapa;
      default: return clave;
    }
  }

  /* ---------- mensajes ---------- */
  function agregarMensaje(texto, quien) {
    const globo = document.createElement("p");
    globo.className = "msg msg--" + quien;
    globo.textContent = texto;          // textContent: nunca se interpreta como HTML
    zonaMensajes.appendChild(globo);
    bajarAlFinal();
  }

  function agregarResumen() {
    const tarjeta = document.createElement("div");
    tarjeta.className = "msg msg--bot msg--resumen";
    const filas = [
      ["Nombre", datos.nombre], ["Teléfono", datos.telefono], ["Tema", datos.tema],
      ["Situación", datos.situacion], ["Detalle", datos.detalle], ["¿Urgente?", datos.urgencia]
    ];
    filas.forEach(function (fila) {
      if (!fila[1]) return;
      const linea = document.createElement("p");
      const etiqueta = document.createElement("strong");
      etiqueta.textContent = fila[0] + ": ";
      linea.appendChild(etiqueta);
      linea.appendChild(document.createTextNode(fila[1]));
      tarjeta.appendChild(linea);
    });
    zonaMensajes.appendChild(tarjeta);
    bajarAlFinal();
  }

  async function escribiendo(ms) {
    const puntos = document.createElement("div");
    puntos.className = "msg msg--bot msg--escribiendo";
    puntos.setAttribute("aria-label", "El asistente está escribiendo");
    puntos.innerHTML = "<span></span><span></span><span></span>";
    zonaMensajes.appendChild(puntos);
    bajarAlFinal();
    await esperar(ms);
    puntos.remove();
  }

  /* ---------- opciones (botones) ---------- */
  function mostrarOpciones(opciones) {
    zonaOpciones.innerHTML = "";
    (opciones || []).forEach(function (opcion) {
      let boton;
      if (opcion.enlace) {
        boton = document.createElement("a");
        boton.href = resolverEnlace(opcion.enlace);
        if (!boton.href.startsWith("tel:")) {
          boton.target = "_blank";
          boton.rel = "noopener";
        }
      } else {
        boton = document.createElement("button");
        boton.type = "button";
        boton.addEventListener("click", function () { elegir(opcion); });
      }
      boton.className = "opcion" + (opcion.estilo ? " opcion--" + opcion.estilo : "");
      boton.textContent = opcion.texto;
      zonaOpciones.appendChild(boton);
    });
    // Los botones achican la zona de mensajes: volver a bajar al último
    requestAnimationFrame(bajarAlFinal);
    setTimeout(bajarAlFinal, 350); // y otra vez cuando termina la animación de los botones
  }

  function elegir(opcion) {
    if (ocupado) return;
    agregarMensaje(opcion.texto, "usuario");
    if (opcion.guardar) Object.assign(datos, opcion.guardar);
    if (opcion.ir === "@reiniciar") return reiniciar();
    irA(opcion.ir);
  }

  /* ---------- pasos ---------- */
  async function irA(nombrePaso) {
    const paso = PASOS[nombrePaso];
    if (!paso) return;
    ocupado = true;
    zonaOpciones.innerHTML = "";
    esperando = null;

    for (const texto of paso.mensajes) {
      await escribiendo(texto === "@resumen" ? 400 : Math.min(500 + texto.length * 12, 1400));
      if (texto === "@resumen") agregarResumen();
      else agregarMensaje(rellenar(texto), "bot");
    }
    ocupado = false;

    if (paso.pedir) {
      esperando = paso.pedir;
      pasoSiguiente = paso.siguiente;
      campoTexto.placeholder = paso.pedir === "telefono" ? "Ej: +56 9 1234 5678" :
                               paso.pedir === "nombre" ? "Escribe tu nombre…" : "Escribe aquí…";
      campoTexto.focus();
      return;
    }
    campoTexto.placeholder = "Escribe tu mensaje…";
    if (paso.siguiente) return irA(paso.siguiente);
    mostrarOpciones(paso.opciones);
  }

  /* ---------- texto escrito por la persona ---------- */
  function validar(campo, valor) {
    if (campo === "nombre") {
      return valor.length >= 2 ? "" : "¿Me podrías escribir tu nombre?";
    }
    if (campo === "telefono") {
      const digitos = valor.replace(/\D/g, "");
      return /^[\d\s()+-]+$/.test(valor) && digitos.length >= 8 && digitos.length <= 12
        ? "" : "Ese número no parece válido. Escríbelo con al menos 8 dígitos, por ejemplo: +56 9 1234 5678.";
    }
    return valor.length >= 3 ? "" : "Cuéntame un poco más, por favor.";
  }

  formulario.addEventListener("submit", async function (evento) {
    evento.preventDefault();
    const valor = campoTexto.value.trim();
    if (!valor || ocupado) return;
    campoTexto.value = "";
    agregarMensaje(valor, "usuario");

    // Si se esperaba un dato (nombre, teléfono, detalle)
    if (esperando) {
      const error = validar(esperando, valor);
      if (error) {
        await escribiendo(500);
        agregarMensaje(error, "bot");
        return;
      }
      datos[esperando] = valor;
      esperando = null;
      return irA(pasoSiguiente);
    }

    // Si no, se buscan palabras clave
    const texto = normalizar(valor);
    const regla = PALABRAS_CLAVE.find(function (r) {
      return r.palabras.some(function (p) { return texto.includes(p); });
    });
    if (regla) {
      if (regla.guardar) Object.assign(datos, regla.guardar);
      irA(regla.ir);
    } else {
      irA("noEntendi");
    }
  });

  /* ---------- abrir, cerrar y reiniciar ---------- */
  function abrir() {
    raiz.classList.add("abierto");
    panel.setAttribute("aria-hidden", "false");
    lanzador.setAttribute("aria-expanded", "true");
    lanzador.setAttribute("aria-label", "Cerrar asistente virtual");
    burbuja.classList.remove("visible");
    if (!iniciado) {
      iniciado = true;
      irA("inicio");
    }
    setTimeout(function () { campoTexto.focus({ preventScroll: true }); }, 300);
  }

  function cerrar() {
    raiz.classList.remove("abierto");
    panel.setAttribute("aria-hidden", "true");
    lanzador.setAttribute("aria-expanded", "false");
    lanzador.setAttribute("aria-label", "Abrir asistente virtual");
    lanzador.focus();
  }

  function reiniciar() {
    datos = {};
    esperando = null;
    zonaMensajes.innerHTML = "";
    zonaOpciones.innerHTML = "";
    irA("inicio");
  }

  lanzador.addEventListener("click", function () {
    raiz.classList.contains("abierto") ? cerrar() : abrir();
  });
  burbuja.addEventListener("click", abrir);
  document.getElementById("asistenteCerrar").addEventListener("click", cerrar);
  document.getElementById("asistenteReiniciar").addEventListener("click", function () {
    if (!ocupado) reiniciar();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && raiz.classList.contains("abierto")) cerrar();
  });

  // Globo de saludo: una vez por visita
  if (CONFIG.saludoTrasSegundos > 0) {
    let yaSaludo = false;
    try { yaSaludo = sessionStorage.getItem("asistenteSaludo") === "1"; } catch (e) { /* sin almacenamiento */ }
    if (!yaSaludo) {
      setTimeout(function () {
        if (raiz.classList.contains("abierto")) return;
        burbuja.classList.add("visible");
        try { sessionStorage.setItem("asistenteSaludo", "1"); } catch (e) { /* sin almacenamiento */ }
      }, CONFIG.saludoTrasSegundos * 1000);
    }
  }
})();
