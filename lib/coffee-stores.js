import { createApi } from "unsplash-js";

const unsplash = createApi({
  accessKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY,
});

const getUrlForCoffeeStores = (latlong, query, limit) => {
  return `https://api.foursquare.com/v3/places/search?query=${query}&ll=${latlong}&limit=${limit}`;
};

const getListOfCoffeeStorePhotos = async () => {
  const photos = await unsplash.search.getPhotos({
    query: "food",
    page: 1,
    perPage: 40,
  });

  const unsplashPhotos = photos.response.results
  return unsplashPhotos.map((result) => result.urls.small)
}

export const fetchCoffeeStores = async (latLong = "6.546628174516895%2C7.428829069003967", limit= 6) => {

  const photos = await getListOfCoffeeStorePhotos()

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: process.env.NEXT_PUBLIC_FOURSQUARE_API_KEY,
    },
  };

  const response = await fetch(
    getUrlForCoffeeStores( latLong, "food", limit),
    options
  );
  // "6.546628174516895%2C7.428829069003967", 
  const data = await response.json();
  return data.results.map((result, index) => {
    return{
      ...result,
      imgUrl: photos.length > 0 ? photos[index] : null,
    }
  })

  // .catch(err => console.error(err));
};
