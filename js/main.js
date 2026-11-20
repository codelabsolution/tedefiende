/* =========================================================
   JAVASCRIPT — TEDEFIENDE.CL
   ---------------------------------------------------------
   1. Menú plegable en teléfono
   2. Encabezado al hacer scroll
   3. Resaltar el enlace de la sección visible
   4. Aparición de elementos al hacer scroll
   5. Validación del formulario de contacto
   6. Año automático en el pie de página
   (El desplazamiento suave lo hace el CSS: scroll-behavior: smooth)
   ========================================================= */

(function () {
  "use strict";

  /* -------------------------------------------------------
     1. MENÚ PLEGABLE EN TELÉFONO
     ------------------------------------------------------- */
  const menuBoton = document.getElementById("menuBoton");
  const menu = document.getElementById("menu");
  const enlacesMenu = document.querySelectorAll(".menu__enlace");

  function abrirCerrarMenu(abrir) {
    menu.classList.toggle("abierto", abrir);
    menuBoton.setAttribute("aria-expanded", abrir);
    menuBoton.setAttribute("aria-label", abrir ? "Cerrar menú" : "Abrir menú");
    document.body.classList.toggle("menu-abierto", abrir);
  }

  menuBoton.addEventListener("click", function () {
    abrirCerrarMenu(!menu.classList.contains("abierto"));
  });

  // Cualquier enlace del menú lo cierra
  menu.querySelectorAll("a").forEach(function (enlace) {
    enlace.addEventListener("click", function () {
      abrirCerrarMenu(false);
    });
  });

  // La tecla Escape también lo cierra
  document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape" && menu.classList.contains("abierto")) {
      abrirCerrarMenu(false);
      menuBoton.focus();
    }
  });

  // Si la pantalla pasa a tamaño escritorio, se cierra el menú del teléfono
  window.matchMedia("(min-width: 1100px)").addEventListener("change", function (e) {
    if (e.matches) abrirCerrarMenu(false);
  });


  /* -------------------------------------------------------
     2. ENCABEZADO AL HACER SCROLL (se achica y toma sombra)
     ------------------------------------------------------- */
  const encabezado = document.getElementById("encabezado");

  function revisarScroll() {
    encabezado.classList.toggle("con-scroll", window.scrollY > 30);
  }

  window.addEventListener("scroll", revisarScroll, { passive: true });
  revisarScroll();


  /* -------------------------------------------------------
     3. RESALTAR EL ENLACE DE LA SECCIÓN VISIBLE
     ------------------------------------------------------- */
  const secciones = document.querySelectorAll("main section[id]");

  const observadorSecciones = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (!entrada.isIntersecting) return;
      enlacesMenu.forEach(function (enlace) {
        enlace.classList.toggle("activo", enlace.getAttribute("href") === "#" + entrada.target.id);
      });
    });
  }, { rootMargin: "-45% 0px -50% 0px" }); // "activa" = la sección al centro de la pantalla

  secciones.forEach(function (seccion) {
    observadorSecciones.observe(seccion);
  });


  /* -------------------------------------------------------
     4. APARICIÓN DE ELEMENTOS AL HACER SCROLL
     Todo elemento con data-revelar aparece al entrar en pantalla.
     ------------------------------------------------------- */
  const observadorRevelar = new IntersectionObserver(function (entradas, observador) {
    entradas.forEach(function (entrada) {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("visible");
        observador.unobserve(entrada.target); // solo una vez
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

  document.querySelectorAll("[data-revelar]").forEach(function (elemento) {
    observadorRevelar.observe(elemento);
  });


  /* -------------------------------------------------------
     4b. CARRUSEL DE VIDEOS
     Flechas y puntos para pasar de un video a otro. Al hacer
     clic en una portada, se reemplaza por el reproductor.
     ------------------------------------------------------- */
  const pista = document.getElementById("carruselPista");

  if (pista) {
    const videos = Array.from(pista.querySelectorAll(".video"));
    const contenedorPuntos = document.getElementById("carruselPuntos");
    let actual = 0;

    // Crea un punto por cada video
    const puntos = videos.map(function (video, i) {
      const punto = document.createElement("button");
      punto.type = "button";
      punto.className = "carrusel__punto";
      punto.setAttribute("aria-label", "Ver video " + (i + 1));
      punto.addEventListener("click", function () { irA(i); });
      contenedorPuntos.appendChild(punto);
      return punto;
    });

    // Detiene cualquier video que se esté reproduciendo
    function detenerVideos() {
      pista.querySelectorAll("video").forEach(function (v) { v.pause(); });
      pista.querySelectorAll("iframe").forEach(function (f) { f.src = f.src; });
    }

    function irA(indice) {
      actual = (indice + videos.length) % videos.length;  // da la vuelta al llegar al final
      pista.style.transform = "translateX(-" + actual * 100 + "%)";
      puntos.forEach(function (p, i) { p.classList.toggle("activo", i === actual); });
      detenerVideos();
    }

    document.getElementById("carruselAnterior").addEventListener("click", function () { irA(actual - 1); });
    document.getElementById("carruselSiguiente").addEventListener("click", function () { irA(actual + 1); });

    // Al hacer clic en la portada: cargar el video propio o el de YouTube
    videos.forEach(function (video) {
      const portada = video.querySelector("button.video__portada");
      if (!portada) return; // tarjetas "próximamente"

      portada.addEventListener("click", function () {
        let reproductor;
        if (video.dataset.youtube) {
          reproductor = document.createElement("iframe");
          reproductor.src = "https://www.youtube-nocookie.com/embed/" + video.dataset.youtube + "?autoplay=1&rel=0";
          reproductor.allow = "autoplay; encrypted-media; picture-in-picture";
          reproductor.allowFullscreen = true;
          reproductor.title = portada.getAttribute("aria-label");
        } else {
          reproductor = document.createElement("video");
          reproductor.src = video.dataset.video;
          reproductor.controls = true;
          reproductor.autoplay = true;
          reproductor.playsInline = true;
          const img = portada.querySelector("img");
          if (img) reproductor.poster = img.src;
        }
        reproductor.className = "video__reproductor";
        portada.replaceWith(reproductor);
      });
    });

    irA(0);
  }


  /* -------------------------------------------------------
     5. VALIDACIÓN DEL FORMULARIO DE CONTACTO
     Por ahora NO envía datos: solo revisa que los campos
     estén bien completados.
     ------------------------------------------------------- */
  const formulario = document.getElementById("formulario");

  // Las páginas de áreas no tienen formulario: en ese caso se omite esta parte
  if (formulario) {
  const estado = document.getElementById("formularioEstado");
  const campos = formulario.querySelectorAll("input, textarea");

  // Reglas de cada campo (fácil de modificar)
  const reglas = {
    nombre: function (valor) {
      if (valor === "") return "Por favor, ingresa tu nombre.";
      if (valor.length < 3) return "El nombre debe tener al menos 3 caracteres.";
      return "";
    },
    correo: function (valor) {
      if (valor === "") return "Por favor, ingresa tu correo.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) return "Ingresa un correo válido (ej: nombre@correo.com).";
      return "";
    },
    telefono: function (valor) {
      if (valor === "") return "Por favor, ingresa tu teléfono.";
      // Acepta números, espacios, guiones, paréntesis y "+"; mínimo 8 dígitos
      const digitos = valor.replace(/\D/g, "");
      if (!/^[\d\s()+-]+$/.test(valor) || digitos.length < 8) return "Ingresa un teléfono válido (mínimo 8 dígitos).";
      return "";
    },
    mensaje: function (valor) {
      if (valor === "") return "Por favor, cuéntanos tu caso.";
      if (valor.length < 10) return "El mensaje debe tener al menos 10 caracteres.";
      return "";
    }
  };

  // Valida un campo y muestra u oculta su mensaje de error
  function validarCampo(campo) {
    const error = reglas[campo.name](campo.value.trim());
    const contenedor = campo.closest(".campo");
    contenedor.classList.toggle("con-error", error !== "");
    contenedor.querySelector(".campo__error").textContent = error;
    campo.setAttribute("aria-invalid", error !== "");
    return error === "";
  }

  campos.forEach(function (campo) {
    // Mientras escribe, se revalida solo si ya tenía error
    campo.addEventListener("input", function () {
      if (campo.closest(".campo").classList.contains("con-error")) validarCampo(campo);
    });
    // Al salir del campo, se valida si escribió algo
    campo.addEventListener("blur", function () {
      if (campo.value.trim() !== "") validarCampo(campo);
    });
  });

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault(); // evita recargar la página

    let primerError = null;
    campos.forEach(function (campo) {
      if (!validarCampo(campo) && !primerError) primerError = campo;
    });

    if (primerError) {
      estado.textContent = "";
      estado.classList.remove("exito");
      primerError.focus();
      return;
    }

    // AQUÍ, más adelante, se conectará el envío real (correo, WhatsApp, etc.)
    estado.textContent = "¡Gracias! Tu mensaje fue validado correctamente. (Envío aún no configurado)";
    estado.classList.add("exito");
    formulario.reset();
  });
  } // fin de "if (formulario)"


  /* -------------------------------------------------------
     6. AÑO AUTOMÁTICO EN EL PIE DE PÁGINA
     ------------------------------------------------------- */
  document.getElementById("anio").textContent = new Date().getFullYear();

})();
