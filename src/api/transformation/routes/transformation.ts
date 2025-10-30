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
        method: 'GET',
        path: '/transformations',
        handler: 'transformation.raw',
        config: { auth: false },
      },
      {
        method: 'GET',
        path: '/transformations/:id',
        handler: 'transformation.rawOne',
        config: { auth: false },
      },
    ],
  };
  