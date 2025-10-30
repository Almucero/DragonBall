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
      method: 'GET',
      path: '/planets',
      handler: 'planet.raw',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/planets/:id',
      handler: 'planet.rawOne',
      config: { auth: false },
    },
  ],
};
