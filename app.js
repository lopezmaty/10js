// ===== Configuración =====
const URL_DATOS = "./data.json";

// ===== Estado =====
let productos = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// ===== Referencias al DOM =====
const estado = document.getElementById("estado");
const listaProductos = document.getElementById("lista-productos");
const listaCarrito = document.getElementById("lista-carrito");
const total = document.getElementById("total");
const btnVaciar = document.getElementById("btn-vaciar");
const btnConfirmar = document.getElementById("btn-confirmar");

// ===== Utilidades =====
const formatearPrecio = (valor) =>
  valor.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

// Notificación con Toastify (reemplaza a alert)
function notificar(mensaje, tipo = "exito") {
  const colores = { exito: "#7A4B2A", error: "#A23B2A", info: "#5E5B53" };
  Toastify({
    text: mensaje,
    duration: 3000,
    gravity: "bottom",
    position: "right",
    style: { background: colores[tipo], borderRadius: "4px" },
  }).showToast();
}

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

// ===== Fetch con async/await + try/catch/finally =====
async function cargarProductos() {
  estado.textContent = "Cargando productos…";
  estado.classList.remove("error");
  listaProductos.innerHTML = "";

  try {
    // Demora simulada para que se vea el estado de carga (se puede borrar)
    await new Promise((resolve) => setTimeout(resolve, 800));

    const respuesta = await fetch(URL_DATOS);

    // fetch no lanza error con 404/500, así que lo chequeamos a mano
    if (!respuesta.ok) {
      throw new Error(`El servidor respondió ${respuesta.status}`);
    }

    productos = await respuesta.json();
    estado.textContent = "";
    renderizarProductos();
    notificar("Productos cargados con éxito");
  } catch (error) {
    console.error("Error al cargar productos:", error);
    estado.textContent = "No se pudieron cargar los productos. Revisá tu conexión e intentá de nuevo.";
    estado.classList.add("error");

    const btnReintentar = document.createElement("button");
    btnReintentar.className = "btn btn-secundario";
    btnReintentar.textContent = "Reintentar";
    btnReintentar.style.marginLeft = ".75rem";
    btnReintentar.addEventListener("click", cargarProductos);
    estado.append(btnReintentar);

    notificar("Error al cargar los productos", "error");
  } finally {
    // Se ejecuta siempre, haya salido bien o mal
    renderizarCarrito();
  }
}

// ===== Renderizado =====
function renderizarProductos() {
  listaProductos.innerHTML = "";

  productos.forEach((producto) => {
    const enCarrito = carrito.find((item) => item.id === producto.id)?.cantidad || 0;
    const disponible = producto.stock - enCarrito;

    const li = document.createElement("li");
    li.className = "producto" + (disponible <= 0 ? " sin-stock" : "");
    li.innerHTML = `
      <div>
        <h3>${producto.nombre}</h3>
        <p class="detalle">${producto.unidad} · ${disponible > 0 ? `stock ${disponible}` : "sin stock"}</p>
      </div>
      <span class="precio">${formatearPrecio(producto.precio)}</span>
      <button class="btn" ${disponible <= 0 ? "disabled" : ""}>Agregar</button>
    `;
    li.querySelector("button").addEventListener("click", () => agregarAlCarrito(producto.id));
    listaProductos.append(li);
  });
}

function renderizarCarrito() {
  listaCarrito.innerHTML = "";

  if (carrito.length === 0) {
    listaCarrito.innerHTML = `<li class="vacio">Todavía no agregaste productos.</li>`;
  }

  carrito.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${item.cantidad} × ${item.nombre}</span><span>${formatearPrecio(item.precio * item.cantidad)}</span>`;
    listaCarrito.append(li);
  });

  const suma = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  total.textContent = formatearPrecio(suma);
  btnVaciar.disabled = btnConfirmar.disabled = carrito.length === 0;
}

// ===== Carrito =====
function agregarAlCarrito(id) {
  const producto = productos.find((p) => p.id === id);
  const item = carrito.find((i) => i.id === id);

  if (item) {
    if (item.cantidad >= producto.stock) {
      notificar(`No hay más stock de ${producto.nombre}`, "error");
      return;
    }
    item.cantidad++;
  } else {
    carrito.push({ id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: 1 });
  }

  guardarCarrito();
  renderizarProductos();
  renderizarCarrito();
  notificar(`${producto.nombre} agregado al pedido`);
}

async function vaciarCarrito() {
  const { isConfirmed } = await Swal.fire({
    title: "¿Vaciar el pedido?",
    text: "Se van a quitar todos los productos.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Vaciar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#A23B2A",
  });

  if (!isConfirmed) return;

  carrito = [];
  guardarCarrito();
  renderizarProductos();
  renderizarCarrito();
  notificar("Pedido vaciado", "info");
}

async function confirmarPedido() {
  const totalTexto = total.textContent;
  const { isConfirmed } = await Swal.fire({
    title: "Confirmar pedido",
    html: `El total es <strong>${totalTexto}</strong>.`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Confirmar",
    cancelButtonText: "Seguir comprando",
    confirmButtonColor: "#7A4B2A",
  });

  if (!isConfirmed) return;

  // Descontamos el stock en memoria (simulación)
  carrito.forEach((item) => {
    const producto = productos.find((p) => p.id === item.id);
    if (producto) producto.stock -= item.cantidad;
  });

  carrito = [];
  guardarCarrito();
  renderizarProductos();
  renderizarCarrito();

  Swal.fire({ title: "Pedido confirmado", text: `Total abonado: ${totalTexto}`, icon: "success", confirmButtonColor: "#7A4B2A" });
}

// ===== Eventos e inicio =====
btnVaciar.addEventListener("click", vaciarCarrito);
btnConfirmar.addEventListener("click", confirmarPedido);
document.addEventListener("DOMContentLoaded", cargarProductos);
