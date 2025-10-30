/**
 * planet controller (original)
 */ 
// import { factories } from '@strapi/strapi'

// export default factories.createCoreController('api::planet.planet');

/**
 * planet controller (modificado)
 */ 
import { factories } from "@strapi/strapi";

const getImageUrl = (image: any) => {
  if (!image) return null;
  if (typeof image === "string") return image;
  if (image.url) return image.url;
  const d = image.data ?? image;
  if (Array.isArray(d)) return d[0]?.attributes?.url ?? null;
  return d?.attributes?.url ?? null;
};

export default factories.createCoreController(
  "api::planet.planet",
  ({ strapi }) => ({
    async raw(ctx) {
      const query = ctx.query as Record<string, any>;
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;
      const start = (page - 1) * limit;

      const [entities, total] = await Promise.all([
        strapi.entityService.findMany("api::planet.planet", {
          start,
          limit,
          sort: { uid: 'asc' },
        }),
        strapi.db.query("api::planet.planet").count(),
      ]);

      const items = entities.map((e: any) => ({
        id: e.uid,
        name: e.name,
        isDestroyed: e.isDestroyed,
        description: e.description,
        image: getImageUrl(e.image),
        deletedAt: e.deletedAt ?? null,
      }));

      const totalPages = Math.ceil((total/2) / limit);
      const baseUrl = `${ctx.request.origin}/api/planets`;
      const makeLink = (p: number) => `${baseUrl}?page=${p}&limit=${limit}`;

      ctx.body = {
        items,
        meta: {
          totalItems: total/2,
          itemCount: items.length,
          itemsPerPage: limit,
          totalPages,
          currentPage: page,
        },
        links: {
          first: makeLink(1),
          previous: page > 1 ? makeLink(page - 1) : "",
          next: page < totalPages ? makeLink(page + 1) : "",
          last: makeLink(totalPages),
        },
      };
    },

    async rawOne(ctx) {
      const { id } = ctx.params as { id: string };
    
      const entity = await strapi.db.query('api::planet.planet').findOne({
        where: { uid: Number(id) },
        populate: {
          image: true,
          characters: { populate: ['image'] },
        },
      });
    
      if (!entity) {
        ctx.status = 404;
        ctx.body = { message: 'Planet not found' };
        return;
      }
    
      const getImageUrl = (img: any) => {
        if (!img) return null;
        if (typeof img === 'string') return img;
        if (img.url) return img.url;
        return img?.data?.attributes?.url ?? null;
      };
    
      const characters = Array.isArray(entity.characters)
        ? entity.characters.map((c: any) => ({
            id: c.uid ?? c.id,
            name: c.name,
            ki: c.ki,
            maxKi: c.maxKi,
            race: c.race,
            gender: c.gender,
            description: c.description,
            image: getImageUrl(c.image),
            affiliation: c.affiliation,
            deletedAt: c.deletedAt ?? null,
          }))
        : [];
    
      ctx.body = {
        id: entity.uid ?? entity.id,
        name: entity.name,
        isDestroyed: entity.isDestroyed,
        description: entity.description,
        image: getImageUrl(entity.image),
        deletedAt: entity.deletedAt ?? null,
        characters,
      };
    }    
  })
);
