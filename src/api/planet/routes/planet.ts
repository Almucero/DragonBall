/**
 * planet router (original)
 */
// import { factories } from '@strapi/strapi';

// export default factories.createCoreRouter('api::planet.planet');

/**
 * planet router (modificado)
 */
module.exports = {
  routes: [
    {
      method: "GET",
      path: "/planets",
      handler: "planet.raw",
      config: { auth: false },
    },
    // Original endpoints (access the original/default responses here)
    {
      method: "GET",
      path: "/planets/raw",
      handler: "planet.originalFind",
      config: { auth: false },
    },
    {
      method: "GET",
      path: "/planets/raw/:id",
      handler: "planet.originalFindOne",
      config: { auth: false },
    },
    {
      method: "GET",
      path: "/planets/:id",
      handler: "planet.rawOne",
      config: { auth: false },
    },
  ],
};
