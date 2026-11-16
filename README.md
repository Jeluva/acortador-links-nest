# acortador-links-nest

API REST de un acortador de links hecha con NestJS. **Es un proyecto de práctica** para mi portfolio: no está pensado para producción (sin autenticación, sin rate limiting, persistencia en un archivo JSON).

## Qué hace

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/links` | Crea un link corto. Body: `{ "url": "https://...", "alias": "opcional" }` |
| `GET` | `/:code` | Redirige (302) a la URL original y suma un click |
| `GET` | `/links` / `/links/:code` | Lista los links / muestra uno con sus clicks |
| `GET` | `/stats` | Total de links, total de clicks y top 5 |
| `DELETE` | `/links/:code` | Borra un link |

- Valida que la URL sea http/https y que el alias tenga 3 a 32 caracteres (`A-Z a-z 0-9 - _`).
- Alias repetido devuelve 409; código inexistente, 404.
- Los datos se guardan en `data/links.json` (configurable con `LINKS_FILE`).

## Cómo correrlo

Requiere Node 22+.

```bash
npm install
npm run build
npm start            # http://localhost:3000  (PORT para cambiar el puerto)
```

Ejemplo:

```bash
curl -X POST localhost:3000/links -H 'content-type: application/json' \
  -d '{"url":"https://nestjs.com","alias":"nest"}'
curl -i localhost:3000/nest
curl localhost:3000/stats
```

## Prueba de humo

`npm test` compila, levanta el servidor en el puerto 3999 con un archivo temporal y recorre el flujo completo con `curl` (crear, redirigir, contar, errores, borrar).

## Stack

NestJS 12, TypeScript, class-validator.
