export default {
  routes: [
    {
      method: "PUT",
      path: "/users/me",
      handler: "user.updateMe",
      config: {
        prefix: "",
        policies: [],
        // Esta ruta requiere autenticación
        // El middleware de autenticación por defecto verificará el token
      },
    },
  ],
};
