import Joi from "joi";

export const UserCredentialsSpec = {
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
};

export const UserSpec = Joi.object()
  .keys({
    firstName: Joi.string().min(2).pattern(new RegExp("^[a-zA-Z\u00C0-\u00FF- ]*$")).example("Homer").required(),
    lastName: Joi.string().min(2).pattern(new RegExp("^[a-zA-Z'\u00C0-\u00FF- ]*$")).example("Simpson").required(),
    email: Joi.string().email().example("homer@simpson.com").required(),
    password: Joi.string().min(6).example("yourSecretPassword").required(),
    gitHub: Joi.string().example("Username1234").optional()
  })
  .label("UserDetails");

export const PlaceSpecBase = Joi.object()
  .keys({
    name: Joi.string().example("Longplayer").required(),
    location: Joi.string().example("London").required(),
    latitude: Joi.number().greater(-90).less(90).example(51.508514).required(),
    longitude: Joi.number().greater(-180).less(180).example(0.008079).required(),
    description: Joi.string()
      .example(
        "<p>If you miss hearing Longplayer on your next trip to London, you’ll get the chance to catch it again—the musical composition will be playing in the old lighthouse at Trinity Buoy Wharf for the next 1,000 years. Longplayer consists of six short recorded pieces written for Tibetan singing bowls that are transposed and combined in such a way that the variations will never repeat during the song’s millennium-long run. It began playing on December 31, 1999, and is scheduled to end in the dying seconds of 2999.</p><p>Custodians of the project have established the Longplayer Trust to devise ways of keeping the music alive in the face of the inevitable technological and social changes that will occur over the next ten centuries.</p>"
      )
      .optional(),
  })
  .label("PlaceDetails");

export const PlaceSpec = PlaceSpecBase
  .keys({
    images: Joi.string().pattern(new RegExp("(https:\\/\\/res\\.cloudinary\\.com\\/dyyleuyou\\/image\\/upload\\/[a-zA-Z.:\\/0-9]*(jpeg|jpg|png),)*")).allow("", null).optional(),
  })
  .label("PlaceDetails");

export const IdSpec = Joi.alternatives().try(Joi.string(), Joi.object()).description("a valid ID");

export const CategorySpec = Joi.object()
  .keys({
    name: Joi.string().pattern(new RegExp("^[a-zA-Z\u00C0-\u00FF- ]*$")).example("Isolated Places").required(),
    places: Joi.array().items(IdSpec).optional(),
  })
  .label("CategoryDetails");


export const PlaceSpecAPI = PlaceSpecBase.keys({
  images: Joi.array().items(Joi.string().pattern(new RegExp("(https:\\/\\/res\\.cloudinary\\.com\\/dyyleuyou\\/image\\/upload\\/[a-zA-Z.:\\/0-9]*(jpeg|jpg|png),)*")).allow("", null).optional()),
  createdBy: IdSpec,
}).label("PlaceSpecAPI");

export const PlaceSpecWithCategory = PlaceSpec.keys({
  categories: Joi.string().allow("", null).optional(),
}).label("PlaceSpecAPI");

export const PlaceSpecWithCategoryAndId = PlaceSpecWithCategory.keys({
  _id: IdSpec,
}).label("PlaceSpecAPI");


export const PlaceSpecPlusWithCategoriesObject = PlaceSpecAPI.keys({
  categories: Joi.array().items(
    Joi.object().keys({
      name: Joi.string().pattern(new RegExp("^[a-zA-Z\u00C0-\u00FF- ]*$")),
      _id: IdSpec,
      __v: Joi.number(),
    })
  ),
  _id: IdSpec,
  __v: Joi.number(),
}).label("PlaceSpecPlusCategories");

export const UserSpecPlus = UserSpec.keys({
  isAdmin: Joi.boolean(),
  _id: IdSpec,
  __v: Joi.number(),
}).label("UserDetailsPlus");

export const PlaceSpecPlus = PlaceSpecAPI.keys({
  _id: IdSpec,
  __v: Joi.number(),
}).label("PlaceDetailsPlus");

export const CategorySpecPlus = CategorySpec.keys({
  _id: IdSpec,
  __v: Joi.number(),
}).label("CategoryDetailsPlus");

export const PlaceIdSpec = Joi.object().keys({
  placeId: IdSpec,
});

export const CategoryIdSpec = Joi.object().keys({
  categoryId: IdSpec,
});

export const UserArray = Joi.array().items(UserSpecPlus).label("UserArray");
export const PlaceArray = Joi.array().items(PlaceSpecPlus).label("PlaceArray");
export const CategoryArray = Joi.array().items(CategorySpecPlus).label("CategoryArray");

export const JwtAuth = Joi.object()
  .keys({
    success: Joi.boolean().example("true").required(),
    token: Joi.string().example("eyJhbGciOiJND.g5YmJisIjoiaGYwNTNjAOhE.gCWGmY5-YigQw0DCBo").required(),
  })
  .label("JwtAuth");