/**
 * transformation router (original)
 */
// import { factories } from '@strapi/strapi';

// export default factories.createCoreRouter('api::transformation.transformation');

/**
 * transformation router (modificado)
 */
export default {
  routes: [
    {
      method: "GET",
      path: "/transformations",
      handler: "transformation.raw",
      config: { auth: false },
    },
    // Original endpoints (access the original/default responses here)
    {
      method: "GET",
      path: "/transformations/raw",
      handler: "transformation.originalFind",
      config: { auth: false },
    },
    {
      method: "GET",
      path: "/transformations/raw/:id",
      handler: "transformation.originalFindOne",
      config: { auth: false },
    },
    {
      method: "GET",
      path: "/transformations/:id",
      handler: "transformation.rawOne",
      config: { auth: false },
    },
  ],
};
