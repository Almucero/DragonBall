export default {
  /**
   * Actualiza los datos del usuario autenticado
   * Solo permite actualizar name y surname
   */
  async updateMe(ctx) {
    const user = ctx.state.user;

    // Verificar que el usuario está autenticado
    if (!user) {
      return ctx.unauthorized(
        "Debes estar autenticado para actualizar tu perfil"
      );
    }

    // Extraer datos del body
    const { name, surname, id, documentId, ...otherFields } = ctx.request.body;

    // SEGURIDAD: Verificar que no se intenten modificar campos no permitidos
    if (id || documentId || Object.keys(otherFields).length > 0) {
      return ctx.forbidden(
        "Solo puedes actualizar los campos: name y surname. " +
          "No puedes modificar el id u otros campos del usuario."
      );
    }

    // Validar que al menos se envíe un campo permitido
    if (!name && !surname) {
      return ctx.badRequest(
        "Debes proporcionar al menos un campo para actualizar (name o surname)"
      );
    }

    try {
      // Preparar los datos a actualizar (solo campos permitidos)
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (surname !== undefined) updateData.surname = surname;

      // SEGURIDAD: Actualizar solo el usuario autenticado (del token)
      // Usamos user.documentId del contexto, nunca del body
      const updatedUser = await strapi
        .documents("plugin::users-permissions.user")
        .update({
          documentId: user.documentId,
          data: updateData,
        });

      // Verificar que el usuario actualizado es el mismo que el autenticado
      if (updatedUser.documentId !== user.documentId) {
        return ctx.forbidden("No tienes permiso para actualizar este usuario");
      }

      // Sanitizar la salida usando la API de sanitización de Strapi
      const contentType = strapi.contentType("plugin::users-permissions.user");
      const sanitizedUser = await strapi.contentAPI.sanitize.output(
        updatedUser,
        contentType,
        { auth: ctx.state.auth }
      );

      ctx.send({
        data: sanitizedUser,
      });
    } catch (error) {
      ctx.badRequest("Error al actualizar el perfil", { error: error.message });
    }
  },
};
