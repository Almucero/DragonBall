/*
 * character router (original)
 */
// import { factories } from '@strapi/strapi';

// export default factories.createCoreRouter('api::character.character');

/*
 * character router (modificado)
 */
module.exports = {
  routes: [
    {
      method: "GET",
      path: "/characters",
      handler: "character.raw",
      config: { auth: false },
    },
    // Original endpoints (access the original/default responses here)
    {
      method: "GET",
      path: "/characters/raw",
      handler: "character.originalFind",
      config: { auth: false },
    },
    {
      method: "GET",
      path: "/characters/raw/:id",
      handler: "character.originalFindOne",
      config: { auth: false },
    },
    {
      method: "GET",
      path: "/characters/:id",
      handler: "character.rawOne",
      config: { auth: false },
    },
  ],
};
