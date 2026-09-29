# Pre-Entrega 10: APIs, Peticiones y Librerías

Simulador de pedidos de panadería que consume un `data.json` local con `fetch` + `async/await`.

- **Fetch con async/await** y `try/catch/finally` (chequeo de `response.ok`).
- **Feedback visual**: mensaje "Cargando productos…", mensaje de error con botón "Reintentar".
- **Librerías (CDN)**: Toastify para notificaciones y SweetAlert2 para confirmaciones. No se usan `alert` nativos.
- **DOM**: productos y carrito renderizados dinámicamente; el carrito persiste en `localStorage`.

## Cómo correrlo
`fetch` de un archivo local no funciona abriendo el HTML con doble clic (`file://`).
Usá la extensión **Live Server** de VS Code o `python -m http.server` y entrá a `http://localhost:8000`.
