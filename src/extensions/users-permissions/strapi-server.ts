export default (plugin) => {
  // Cargar las rutas personalizadas
  const customRoutes = require("./routes/content-api/user");

  // IMPORTANTE: Añadir las rutas personalizadas AL PRINCIPIO del array
  // para que se evalúen antes que las rutas por defecto (/users/:id)
  plugin.routes["content-api"].routes.unshift(...customRoutes.default.routes);

  // Cargar el controlador personalizado
  // Note: folder is named `controller` (singular) in source tree.
  const customController = require("./controller/user");
  plugin.controllers.user = {
    ...plugin.controllers.user,
    ...customController.default,
  };

  return plugin;
};
